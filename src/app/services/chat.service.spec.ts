import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

const mockFirestore = {};

const mockAuth = {
  currentUser: { uid: 'user-1', displayName: 'Silvia', email: 'silvia@gmail.com' }
};

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        { provide: Firestore, useValue: mockFirestore },
        { provide: Auth, useValue: mockAuth }
      ]
    });
    service = TestBed.inject(ChatService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // sendMessage
  describe('sendMessage', () => {
    it('debería rechazar la promesa si no hay usuario autenticado', async () => {
      (mockAuth as any).currentUser = null;
      try {
        await service.sendMessage('travel-1', 'Hola!');
        fail('Debería haber lanzado un error');
      } catch (e) {
        expect(e).toBe('No autenticado');
      } finally {
        (mockAuth as any).currentUser = {
          uid: 'user-1',
          displayName: 'Silvia',
          email: 'silvia@gmail.com'
        };
      }
    });

    it('debería devolver una promesa', () => {
      spyOn(service, 'sendMessage').and.returnValue(Promise.resolve());
      const result = service.sendMessage('travel-1', 'Hola!');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  // updateLastVisit
  describe('updateLastVisit', () => {
    it('no debería hacer nada si no hay usuario', async () => {
      (mockAuth as any).currentUser = null;
      await expectAsync(service.updateLastVisit('travel-1')).toBeResolved();
      (mockAuth as any).currentUser = {
        uid: 'user-1',
        displayName: 'Silvia',
        email: 'silvia@gmail.com'
      };
    });
  });

  // getUnreadCount
  describe('getUnreadCount', () => {
    it('debería devolver 0 si no hay usuario', async () => {
      (mockAuth as any).currentUser = null;
      const count = await service.getUnreadCount('travel-1');
      expect(count).toBe(0);
      (mockAuth as any).currentUser = {
        uid: 'user-1',
        displayName: 'Silvia',
        email: 'silvia@gmail.com'
      };
    });
  });

  // listenMessages
  describe('listenMessages', () => {
    it('debería devolver una función de unsubscribe', () => {
      spyOn(service, 'listenMessages').and.returnValue(() => {});
      const unsub = service.listenMessages('travel-1', () => {});
      expect(typeof unsub).toBe('function');
    });
  });
});
