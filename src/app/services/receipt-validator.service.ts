import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export type ValidationMode = 'ticket' | 'payment';

export interface ReceiptValidationResult {
  isValid: boolean;
  confidence: number;
  detectedAmount?: number;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class ReceiptValidatorService {

  async validateReceipt(
    imageUrl: string,
    expectedAmount: number,
    mode: ValidationMode = 'payment'
  ): Promise<ReceiptValidationResult> {
    try {
      const response = await fetch(
        `/vision-api/v1/images:annotate?key=${environment.visionApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { source: { imageUri: imageUrl } },
              features: [
                { type: 'TEXT_DETECTION', maxResults: 1 },
                { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
              ]
            }]
          })
        }
      );

      const data = await response.json();
      console.log('Vision API response:', JSON.stringify(data));

      const fullText = data.responses?.[0]?.fullTextAnnotation?.text || '';
      console.log('Texto detectado:', fullText);

      return mode === 'ticket'
        ? this.analyzeTicket(fullText, expectedAmount)
        : this.analyzePayment(fullText, expectedAmount);

    } catch (error) {
      console.error('Error validando recibo:', error);
      return {
        isValid: false,
        confidence: 0,
        reason: 'Error al analizar la imagen'
      };
    }
  }

  private analyzePayment(text: string, expectedAmount: number): ReceiptValidationResult {
    const lowerText = text.toLowerCase();

    const paymentKeywords = [
      'bizum', 'transferencia', 'pago', 'recibido', 'enviado',
      'importe', 'total', 'concepto', 'beneficiario', 'ordenante',
      'iban', 'banco', 'confirmación', 'operación', 'transacción',
      'paypal', 'revolut', 'receipt', 'payment', 'transfer'
    ];

    const foundKeywords = paymentKeywords.filter(k => lowerText.includes(k));
    const hasPaymentKeywords = foundKeywords.length >= 2;

    const amountRegex = /(\d+[.,]\d{2})\s*€?/g;
    const amounts: number[] = [];
    let match;
    while ((match = amountRegex.exec(text)) !== null) {
      amounts.push(parseFloat(match[1].replace(',', '.')));
    }

    const tolerance = expectedAmount * 0.1;
    const amountMatch = amounts.some(a => Math.abs(a - expectedAmount) <= tolerance);

    let confidence = 0;
    if (hasPaymentKeywords) confidence += 60;
    if (amountMatch) confidence += 30;
    if (text.length > 50) confidence += 10;

    const isValid = confidence >= 60;

    let reason = '';
    if (!hasPaymentKeywords && !amountMatch) {
      reason = 'La imagen no parece un comprobante de pago válido';
    } else if (!hasPaymentKeywords) {
      reason = 'No se detectaron palabras clave de pago en el comprobante';
    } else if (!amountMatch && amounts.length > 0) {
      reason = `El importe detectado (${amounts[0]}€) no coincide con el esperado (${expectedAmount}€)`;
    } else {
      reason = `Comprobante válido detectado con ${foundKeywords.join(', ')}`;
    }

    return { isValid, confidence, detectedAmount: amounts[0], reason };
  }

  private analyzeTicket(text: string, expectedAmount: number): ReceiptValidationResult {
    const lowerText = text.toLowerCase();

    const ticketKeywords = [
      'total', 'subtotal', 'iva', 'ticket', 'factura', 'recibo',
      'importe', 'precio', 'unidades', 'cantidad', 'descripcion',
      'articulo', 'producto', 'gracias', 'cif', 'nif', 'restaurante',
      'supermercado', 'tienda', 'fecha', 'hora', 'cajero', 'efectivo',
      'tarjeta', 'cambio', 'euro', '€'
    ];

    const foundKeywords = ticketKeywords.filter(k => lowerText.includes(k));
    const hasTicketKeywords = foundKeywords.length >= 2;

    const amountRegex = /(\d+[.,]\d{2})\s*€?/g;
    const amounts: number[] = [];
    let match;
    while ((match = amountRegex.exec(text)) !== null) {
      amounts.push(parseFloat(match[1].replace(',', '.')));
    }

    const hasAmounts = amounts.length > 0;

    let confidence = 0;
    if (hasTicketKeywords) confidence += 50;
    if (hasAmounts) confidence += 30;
    if (text.length > 30) confidence += 20;

    const isValid = confidence >= 50;

    let reason = '';
    if (!hasTicketKeywords && !hasAmounts) {
      reason = 'La imagen no parece un ticket o factura válido';
    } else if (!hasTicketKeywords) {
      reason = 'No se detectaron palabras clave de ticket o factura';
    } else if (!hasAmounts) {
      reason = 'No se detectaron importes en el ticket';
    } else {
      reason = `Ticket válido detectado con ${foundKeywords.slice(0, 4).join(', ')}`;
    }

    return { isValid, confidence, detectedAmount: amounts[0], reason };
  }
}
