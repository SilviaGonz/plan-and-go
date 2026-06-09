import { TestBed } from '@angular/core/testing';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EmailService]
    });
    service = TestBed.inject(EmailService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // sendInvitationEmail
  describe('sendInvitationEmail', () => {
    beforeEach(() => {
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 'email-1' })
        } as Response)
      );
    });

    it('debería llamar a fetch al enviar el email', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-123'
      );
      expect(window.fetch).toHaveBeenCalled();
    });

    it('debería llamar al endpoint correcto de Resend', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-123'
      );
      const args = (window.fetch as jasmine.Spy).calls.mostRecent().args;
      expect(args[0]).toBe('/resend-api/emails');
    });

    it('debería usar el método POST', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-123'
      );
      const args = (window.fetch as jasmine.Spy).calls.mostRecent().args;
      expect(args[1].method).toBe('POST');
    });

    it('debería incluir el nombre del viaje en el cuerpo', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-123'
      );
      const args = (window.fetch as jasmine.Spy).calls.mostRecent().args;
      const body = JSON.parse(args[1].body);
      expect(body.subject).toContain('Viaje a Tenerife');
    });

    it('debería incluir el nombre del invitador en el asunto', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-123'
      );
      const args = (window.fetch as jasmine.Spy).calls.mostRecent().args;
      const body = JSON.parse(args[1].body);
      expect(body.subject).toContain('Silvia');
    });

    it('debería incluir el token en la URL de invitación del HTML', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-123'
      );
      const args = (window.fetch as jasmine.Spy).calls.mostRecent().args;
      const body = JSON.parse(args[1].body);
      expect(body.html).toContain('token-123');
    });

    it('debería incluir la URL de invitación correcta', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-abc'
      );
      const args = (window.fetch as jasmine.Spy).calls.mostRecent().args;
      const body = JSON.parse(args[1].body);
      expect(body.html).toContain('http://localhost:4200/invite/token-abc');
    });

    it('debería incluir el email del destinatario en el HTML', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-123'
      );
      const args = (window.fetch as jasmine.Spy).calls.mostRecent().args;
      const body = JSON.parse(args[1].body);
      expect(body.html).toContain('prueba@gmail.com');
    });

    it('debería usar el remitente correcto', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-123'
      );
      const args = (window.fetch as jasmine.Spy).calls.mostRecent().args;
      const body = JSON.parse(args[1].body);
      expect(body.from).toBe('onboarding@resend.dev');
    });

    it('debería lanzar error si la respuesta no es ok', async () => {
      (window.fetch as jasmine.Spy).and.returnValue(
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Bad Request' })
        } as Response)
      );
      await expectAsync(
        service.sendInvitationEmail('prueba@gmail.com', 'Silvia', 'Viaje', 'token-123')
      ).toBeRejectedWithError('Error enviando email de invitación');
    });

    it('debería incluir Authorization en los headers', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-123'
      );
      const args = (window.fetch as jasmine.Spy).calls.mostRecent().args;
      expect(args[1].headers['Authorization']).toContain('Bearer');
    });

    it('debería incluir Content-Type application/json en los headers', async () => {
      await service.sendInvitationEmail(
        'prueba@gmail.com',
        'Silvia',
        'Viaje a Tenerife',
        'token-123'
      );
      const args = (window.fetch as jasmine.Spy).calls.mostRecent().args;
      expect(args[1].headers['Content-Type']).toBe('application/json');
    });
  });
});
