import { TestBed } from '@angular/core/testing';
import { ReceiptValidatorService } from './receipt-validator.service';

describe('ReceiptValidatorService', () => {
  let service: ReceiptValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReceiptValidatorService]
    });
    service = TestBed.inject(ReceiptValidatorService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // analyzePayment
  describe('analyzePayment', () => {
    it('debería validar un comprobante Bizum con importe correcto', () => {
      const text = 'Bizum\nImporte: 50,00€\nConcepto: Pago viaje\nConfirmación de pago recibido';
      const result = (service as any).analyzePayment(text, 50);
      expect(result.isValid).toBeTrue();
      expect(result.confidence).toBeGreaterThanOrEqual(60);
    });

    it('debería rechazar texto sin palabras clave de pago', () => {
      const text = 'Este es un texto sin ninguna palabra clave relacionada con pagos';
      const result = (service as any).analyzePayment(text, 50);
      expect(result.isValid).toBeFalse();
    });

    it('debería detectar el importe correctamente', () => {
      const text = 'Bizum\nImporte: 25,50€\nPago recibido';
      const result = (service as any).analyzePayment(text, 25.5);
      expect(result.detectedAmount).toBe(25.5);
    });

    it('debería validar con tolerancia del 10% en el importe', () => {
      const text = 'Bizum\nImporte: 55,00€\nPago recibido\nConfirmación';
      const result = (service as any).analyzePayment(text, 50);
      expect(result.isValid).toBeTrue();
    });

    it('debería rechazar si el importe difiere más del 10%', () => {
      const text = 'Bizum\nImporte: 100,00€\nPago recibido\nConfirmación transferencia';
      const result = (service as any).analyzePayment(text, 50);
      expect(result.amountMatch).not.toBeTruthy();
    });

    it('debería aumentar la confianza si el texto es largo', () => {
      const shortText = 'Bizum pago recibido';
      const longText = 'Bizum\nImporte: 50,00€\nConcepto: Pago viaje grupal\nConfirmación de pago recibido\nBeneficiario: Silvia García\nOrdenante: Paula Martínez';
      const shortResult = (service as any).analyzePayment(shortText, 50);
      const longResult = (service as any).analyzePayment(longText, 50);
      expect(longResult.confidence).toBeGreaterThanOrEqual(shortResult.confidence);
    });

    it('debería detectar transferencia bancaria como válida', () => {
      const text = 'Transferencia bancaria\nIBAN: ES12 1234\nImporte: 30,00€\nConcepto: pago\nBanco confirmación';
      const result = (service as any).analyzePayment(text, 30);
      expect(result.isValid).toBeTrue();
    });

    it('debería detectar PayPal como válido', () => {
      const text = 'PayPal\nPago enviado\nImporte: 20,00€\nConcepto: viaje\nTransacción completada';
      const result = (service as any).analyzePayment(text, 20);
      expect(result.isValid).toBeTrue();
    });

    it('debería devolver reason de error si no hay palabras clave ni importe', () => {
      const text = 'Texto sin relación con pagos';
      const result = (service as any).analyzePayment(text, 50);
      expect(result.reason).toBe('La imagen no parece un comprobante de pago válido');
    });

    it('debería devolver reason si hay palabras clave pero no importe coincidente', () => {
  const text = 'Bizum pago recibido transferencia importe 10,00€';
  const result = (service as any).analyzePayment(text, 999);
  expect(result.reason).toContain('no coincide');
});

    it('debería devolver reason de comprobante válido si pasa la validación', () => {
      const text = 'Bizum\nImporte: 50,00€\nPago recibido confirmación';
      const result = (service as any).analyzePayment(text, 50);
      expect(result.reason).toContain('Comprobante válido');
    });

    it('debería manejar texto vacío sin errores', () => {
      const result = (service as any).analyzePayment('', 50);
      expect(result.isValid).toBeFalse();
      expect(result.confidence).toBe(0);
    });

    it('debería detectar importes con coma como separador decimal', () => {
      const text = 'Bizum\nImporte: 75,00€\nPago recibido confirmación';
      const result = (service as any).analyzePayment(text, 75);
      expect(result.detectedAmount).toBe(75);
    });

    it('debería detectar importes con punto como separador decimal', () => {
      const text = 'Bizum\nImporte: 75.00€\nPago recibido confirmación';
      const result = (service as any).analyzePayment(text, 75);
      expect(result.detectedAmount).toBe(75);
    });

    it('debería necesitar al menos 2 palabras clave para validar', () => {
      const text = 'Solo bizum sin más palabras clave';
      const result = (service as any).analyzePayment(text, 50);
      expect(result.isValid).toBeFalse();
    });
  });

  // analyzeTicket
  describe('analyzeTicket', () => {
    it('debería validar un ticket con palabras clave e importe', () => {
      const text = 'Restaurante El Teide\nTotal: 45,50€\nIVA incluido\nFecha: 01/07/2026\nGracias por su visita';
      const result = (service as any).analyzeTicket(text, 45.5);
      expect(result.isValid).toBeTrue();
    });

    it('debería rechazar texto sin palabras clave de ticket', () => {
  const text = 'Hola mundo';
  const result = (service as any).analyzeTicket(text, 50);
  expect(result.isValid).toBeFalse();
});

    it('debería detectar el importe correctamente', () => {
      const text = 'Ticket\nTotal: 33,25€\nIVA: 10%\nProducto: Menú del día';
      const result = (service as any).analyzeTicket(text, 33.25);
      expect(result.detectedAmount).toBe(33.25);
    });

    it('debería validar una factura con IVA y total', () => {
      const text = 'Factura\nSubtotal: 40,00€\nIVA 21%: 8,40€\nTotal: 48,40€\nCIF: B12345678';
      const result = (service as any).analyzeTicket(text, 48.4);
      expect(result.isValid).toBeTrue();
    });

    it('debería aumentar confianza si el texto es largo', () => {
      const shortText = 'Total ticket';
      const longText = 'Supermercado El Corte Inglés\nFecha: 01/07/2026\nHora: 12:30\nProducto: Agua mineral\nCantidad: 2\nPrecio: 1,50€\nTotal: 3,00€\nIVA incluido\nGracias por su compra';
      const shortResult = (service as any).analyzeTicket(shortText, 3);
      const longResult = (service as any).analyzeTicket(longText, 3);
      expect(longResult.confidence).toBeGreaterThanOrEqual(shortResult.confidence);
    });

    it('debería rechazar si tiene palabras clave pero no importes', () => {
      const text = 'Restaurante\nTotal\nIVA\nFecha\nGracias por su visita en nuestra tienda';
      const result = (service as any).analyzeTicket(text, 50);
      expect(result.reason).toBe('No se detectaron importes en el ticket');
    });

    it('debería devolver reason de ticket válido si pasa la validación', () => {
      const text = 'Restaurante El Teide\nTotal: 45,50€\nIVA incluido\nFecha: 01/07/2026';
      const result = (service as any).analyzeTicket(text, 45.5);
      expect(result.reason).toContain('Ticket válido');
    });

    it('debería manejar texto vacío sin errores', () => {
      const result = (service as any).analyzeTicket('', 50);
      expect(result.isValid).toBeFalse();
      expect(result.confidence).toBe(0);
    });

    it('debería detectar supermercado como ticket válido', () => {
      const text = 'Supermercado Mercadona\nTotal: 25,60€\nIVA incluido\nFecha: 01/07/2026\nGracias';
      const result = (service as any).analyzeTicket(text, 25.6);
      expect(result.isValid).toBeTrue();
    });

    it('debería ser insensible a mayúsculas en las palabras clave', () => {
      const text = 'RESTAURANTE\nTOTAL: 30,00€\nIVA INCLUIDO\nFECHA: 01/07/2026';
      const result = (service as any).analyzeTicket(text, 30);
      expect(result.isValid).toBeTrue();
    });

    it('debería devolver reason de error si no hay palabras clave ni importe', () => {
      const text = 'Texto completamente irrelevante';
      const result = (service as any).analyzeTicket(text, 50);
      expect(result.reason).toBe('La imagen no parece un ticket o factura válido');
    });

    it('debería necesitar al menos 2 palabras clave para validar', () => {
  const text = 'Solo bizum';
  const result = (service as any).analyzeTicket(text, 50);
  expect(result.isValid).toBeFalse();
});

    it('debería incluir máximo 4 palabras clave en el reason', () => {
      const text = 'Restaurante\nTotal: 50,00€\nIVA\nFecha\nCajero\nEfectivo\nTicket\nGracias\nSubtotal';
      const result = (service as any).analyzeTicket(text, 50);
      if (result.isValid) {
        const keywords = result.reason.replace('Ticket válido detectado con ', '').split(', ');
        expect(keywords.length).toBeLessThanOrEqual(4);
      }
    });
  });

  // validateReceipt
  describe('validateReceipt', () => {
    beforeEach(() => {
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            responses: [{
              fullTextAnnotation: {
                text: 'Bizum\nImporte: 50,00€\nPago recibido confirmación'
              }
            }]
          })
        } as Response)
      );
    });

    it('debería llamar a fetch con la URL correcta', async () => {
      await service.validateReceipt('https://image.jpg', 50, 'payment');
      expect(window.fetch).toHaveBeenCalled();
      const url = (window.fetch as jasmine.Spy).calls.mostRecent().args[0];
      expect(url).toContain('/vision-api/v1/images:annotate');
    });

    it('debería usar el modo payment por defecto', async () => {
      spyOn(service as any, 'analyzePayment').and.returnValue({
        isValid: true, confidence: 100, reason: 'Válido'
      });
      await service.validateReceipt('https://image.jpg', 50);
      expect((service as any).analyzePayment).toHaveBeenCalled();
    });

    it('debería usar analyzeTicket en modo ticket', async () => {
      spyOn(service as any, 'analyzeTicket').and.returnValue({
        isValid: true, confidence: 100, reason: 'Válido'
      });
      await service.validateReceipt('https://image.jpg', 50, 'ticket');
      expect((service as any).analyzeTicket).toHaveBeenCalled();
    });

    it('debería usar analyzePayment en modo payment', async () => {
      spyOn(service as any, 'analyzePayment').and.returnValue({
        isValid: true, confidence: 100, reason: 'Válido'
      });
      await service.validateReceipt('https://image.jpg', 50, 'payment');
      expect((service as any).analyzePayment).toHaveBeenCalled();
    });

    it('debería devolver isValid false si fetch falla', async () => {
      (window.fetch as jasmine.Spy).and.returnValue(Promise.reject(new Error('Network error')));
      const result = await service.validateReceipt('https://image.jpg', 50, 'payment');
      expect(result.isValid).toBeFalse();
      expect(result.confidence).toBe(0);
      expect(result.reason).toBe('Error al analizar la imagen');
    });

    it('debería manejar respuesta vacía de la API', async () => {
      (window.fetch as jasmine.Spy).and.returnValue(
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ responses: [{}] })
        } as Response)
      );
      const result = await service.validateReceipt('https://image.jpg', 50, 'payment');
      expect(result).toBeTruthy();
    });

    it('debería usar POST como método', async () => {
      await service.validateReceipt('https://image.jpg', 50, 'payment');
      const options = (window.fetch as jasmine.Spy).calls.mostRecent().args[1];
      expect(options.method).toBe('POST');
    });

    it('debería incluir Content-Type application/json', async () => {
      await service.validateReceipt('https://image.jpg', 50, 'payment');
      const options = (window.fetch as jasmine.Spy).calls.mostRecent().args[1];
      expect(options.headers['Content-Type']).toBe('application/json');
    });
  });
});
