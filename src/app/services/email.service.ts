import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmailService {

  private apiKey = environment.firebaseConfig.resendApiKey;
  private testEmail = environment.firebaseConfig.testEmail;

  async sendInvitationEmail(
    toEmail: string,
    invitedByName: string,
    travelName: string,
    token: string
  ) {
    const inviteUrl = `http://localhost:4200/invite/${token}`;

    const response = await fetch('/resend-api/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: this.testEmail,
        subject: `${invitedByName} te invita a unirte a "${travelName}" en Plan&Go`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #BE681C;">¡Te han invitado a un viaje!</h2>
            <p>Invitación para: <strong>${toEmail}</strong></p>
            <p><strong>${invitedByName}</strong> te ha invitado a unirte al viaje <strong>${travelName}</strong> en Plan&Go.</p>
            <a href="${inviteUrl}" style="
              display: inline-block;
              background: #BE681C;
              color: white;
              padding: 12px 24px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              margin-top: 16px;
            ">
              Aceptar invitación
            </a>
            <p style="color: #737272; font-size: 0.85rem; margin-top: 24px;">
              Si no esperabas esta invitación puedes ignorar este email.
            </p>
          </div>
        `
      })
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Respuesta Resend:', data);

    if (!response.ok) {
      throw new Error('Error enviando email de invitación');
    }
  }
}
