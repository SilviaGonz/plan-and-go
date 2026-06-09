import { TestBed } from '@angular/core/testing';
import { InvitationService } from './invitation.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { EmailService } from './email.service';

const mockFirestore = {};

const mockAuth = {
  currentUser: {
    uid: 'user-1',
    email: 'silvia@gmail.com',
    displayName: 'Silvia'
  }
};

const mockEmailService = {
  sendInvitationEmail: jasmine.createSpy('sendInvitationEmail').and.returnValue(Promise.resolve())
};

describe('InvitationService', () => {
  let service: InvitationService;

  beforeEach(() => {
    mockEmailService.sendInvitationEmail.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        InvitationService,
        { provide: Firestore, useValue: mockFirestore },
        { provide: Auth, useValue: mockAuth },
        { provide: EmailService, useValue: mockEmailService }
      ]
    });
    service = TestBed.inject(InvitationService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // generateToken (indirectamente a través de sendInvitations)
  describe('generateToken', () => {
    it('debería generar tokens únicos', () => {
      const token1 = (service as any).generateToken();
      const token2 = (service as any).generateToken();
      expect(token1).not.toBe(token2);
    });

    it('debería generar un token no vacío', () => {
      const token = (service as any).generateToken();
      expect(token.length).toBeGreaterThan(0);
    });

    it('debería generar un token de tipo string', () => {
      const token = (service as any).generateToken();
      expect(typeof token).toBe('string');
    });

    it('debería generar tokens de longitud suficiente', () => {
      const token = (service as any).generateToken();
      expect(token.length).toBeGreaterThan(5);
    });

    it('debería generar tokens diferentes en llamadas consecutivas', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 10; i++) {
        tokens.add((service as any).generateToken());
      }
      expect(tokens.size).toBe(10);
    });
  });

  // sendInvitations
  describe('sendInvitations', () => {
    it('no debería hacer nada si no hay usuario autenticado', async () => {
      (mockAuth as any).currentUser = null;
      await service.sendInvitations('travel-1', 'Viaje a Tenerife', ['prueba@gmail.com']);
      expect(mockEmailService.sendInvitationEmail).not.toHaveBeenCalled();
      (mockAuth as any).currentUser = { uid: 'user-1', email: 'silvia@gmail.com', displayName: 'Silvia' };
    });

    it('no debería enviar emails si la lista está vacía', async () => {
      spyOn(service, 'sendInvitations').and.returnValue(Promise.resolve());
      await service.sendInvitations('travel-1', 'Viaje a Tenerife', []);
      expect(mockEmailService.sendInvitationEmail).not.toHaveBeenCalled();
    });

    it('debería llamar a sendInvitations con los parámetros correctos', async () => {
      spyOn(service, 'sendInvitations').and.returnValue(Promise.resolve());
      await service.sendInvitations('travel-1', 'Viaje a Tenerife', ['prueba@gmail.com']);
      expect(service.sendInvitations).toHaveBeenCalledWith(
        'travel-1', 'Viaje a Tenerife', ['prueba@gmail.com']
      );
    });
  });

  // getInvitationByToken
  describe('getInvitationByToken', () => {
    it('debería llamar a getInvitationByToken con el token correcto', async () => {
      spyOn(service, 'getInvitationByToken').and.returnValue(Promise.resolve(null));
      await service.getInvitationByToken('token-123');
      expect(service.getInvitationByToken).toHaveBeenCalledWith('token-123');
    });

    it('debería devolver null si no existe la invitación', async () => {
      spyOn(service, 'getInvitationByToken').and.returnValue(Promise.resolve(null));
      const result = await service.getInvitationByToken('token-inexistente');
      expect(result).toBeNull();
    });

    it('debería devolver una promesa', () => {
      spyOn(service, 'getInvitationByToken').and.returnValue(Promise.resolve(null));
      const result = service.getInvitationByToken('token-123');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  // acceptInvitation
  describe('acceptInvitation', () => {
    it('no debería hacer nada si no hay usuario autenticado', async () => {
      (mockAuth as any).currentUser = null;
      spyOn(service, 'acceptInvitation').and.callThrough();
      await service.acceptInvitation('inv-1', 'travel-1');
      (mockAuth as any).currentUser = { uid: 'user-1', email: 'silvia@gmail.com', displayName: 'Silvia' };
    });

    it('debería llamar a acceptInvitation con los parámetros correctos', async () => {
      spyOn(service, 'acceptInvitation').and.returnValue(Promise.resolve());
      await service.acceptInvitation('inv-1', 'travel-1');
      expect(service.acceptInvitation).toHaveBeenCalledWith('inv-1', 'travel-1');
    });

    it('debería devolver una promesa', () => {
      spyOn(service, 'acceptInvitation').and.returnValue(Promise.resolve());
      const result = service.acceptInvitation('inv-1', 'travel-1');
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
