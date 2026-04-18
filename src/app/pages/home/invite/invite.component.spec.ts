import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { InviteComponent } from './invite.component';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '../../../services/invitation.service';
import { Firestore } from '@angular/fire/firestore';
import { EmailService } from '../../../services/email.service';

const mockAuth = {
  currentUser: { uid: 'user-1', email: 'silvia@gmail.com', displayName: 'Silvia' }
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

const mockRoute = {
  snapshot: { paramMap: { get: () => 'token-123' } }
};

const mockInvitation = {
  id: 'inv-1',
  travelId: 'travel-1',
  travelName: 'Viaje a Tenerife',
  invitedEmail: 'silvia@gmail.com',
  invitedBy: 'user-2',
  invitedByName: 'Paula',
  token: 'token-123',
  status: 'pending',
  createdAt: new Date()
};

const mockInvitationService = {
  getInvitationByToken: jasmine.createSpy('getInvitationByToken').and.returnValue(
    Promise.resolve(mockInvitation)
  ),
  acceptInvitation: jasmine.createSpy('acceptInvitation').and.returnValue(Promise.resolve())
};

const mockFirestore = {};
const mockEmailService = {
  sendInvitationEmail: jasmine.createSpy('sendInvitationEmail').and.returnValue(Promise.resolve())
};

describe('InviteComponent', () => {
  let component: InviteComponent;
  let fixture: ComponentFixture<InviteComponent>;

  beforeEach(async () => {
    mockRouter.navigate.calls.reset();
    mockInvitationService.getInvitationByToken.calls.reset();
    mockInvitationService.acceptInvitation.calls.reset();
    mockInvitationService.getInvitationByToken.and.returnValue(Promise.resolve(mockInvitation));

    await TestBed.configureTestingModule({
      imports: [InviteComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: InvitationService, useValue: mockInvitationService },
        { provide: Firestore, useValue: mockFirestore },
        { provide: EmailService, useValue: mockEmailService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InviteComponent);
    component = fixture.componentInstance;
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener valores por defecto correctos', () => {
      expect(component.loading).toBeTrue();
      expect(component.accepting).toBeFalse();
      expect(component.error).toBe('');
      expect(component.success).toBeFalse();
      expect(component.invitation).toBeNull();
    });
  });

  // goHome
  describe('goHome', () => {
    it('debería navegar al dashboard', () => {
      component.goHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('debería llamar a navigate solo una vez', () => {
      component.goHome();
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });
  });

  // accept
  describe('accept', () => {
    it('no debería hacer nada si no hay invitación', async () => {
      component.invitation = null;
      await component.accept();
      expect(mockInvitationService.acceptInvitation).not.toHaveBeenCalled();
    });

    it('debería redirigir a login si no hay usuario autenticado', async () => {
      (mockAuth as any).currentUser = null;
      component.invitation = mockInvitation as any;
      await component.accept();
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { redirect: '/invite/token-123' } }
      );
      (mockAuth as any).currentUser = { uid: 'user-1', email: 'silvia@gmail.com', displayName: 'Silvia' };
    });

    it('debería llamar a acceptInvitation con los parámetros correctos', async () => {
      component.invitation = mockInvitation as any;
      await component.accept();
      expect(mockInvitationService.acceptInvitation).toHaveBeenCalledWith('inv-1', 'travel-1');
    });

  it('debería establecer success a true tras aceptar', async () => {
  component.invitation = mockInvitation as any;
  await component.accept();
  expect(component.success).toBeTrue();
});

    it('debería establecer error si acceptInvitation falla', async () => {
      mockInvitationService.acceptInvitation.and.returnValue(Promise.reject(new Error('Error')));
      component.invitation = mockInvitation as any;
      await component.accept();
      expect(component.error).toBe('Error al aceptar la invitación');
    });

    it('debería resetear accepting a false tras aceptar', async () => {
      component.invitation = mockInvitation as any;
      await component.accept();
      expect(component.accepting).toBeFalse();
    });

    it('debería resetear accepting a false si hay error', async () => {
      mockInvitationService.acceptInvitation.and.returnValue(Promise.reject(new Error('Error')));
      component.invitation = mockInvitation as any;
      await component.accept();
      expect(component.accepting).toBeFalse();
    });
  });
});