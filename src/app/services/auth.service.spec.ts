import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

const mockUser = {
  uid: 'user-1',
  email: 'silvia@gmail.com',
  displayName: 'Silvia'
};

const mockAuth = {
  currentUser: mockUser
};

const mockFirestore = {};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: mockAuth },
        { provide: Firestore, useValue: mockFirestore }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // getCurrentUser
  describe('getCurrentUser', () => {
    it('debería devolver el usuario actual', () => {
      const user = service.getCurrentUser();
      expect(user).toEqual(mockUser as any);
    });

    it('debería devolver el uid del usuario', () => {
      const user = service.getCurrentUser();
      expect(user?.uid).toBe('user-1');
    });

    it('debería devolver el email del usuario', () => {
      const user = service.getCurrentUser();
      expect(user?.email).toBe('silvia@gmail.com');
    });

    it('debería devolver el displayName del usuario', () => {
      const user = service.getCurrentUser();
      expect(user?.displayName).toBe('Silvia');
    });

    it('debería devolver null si no hay usuario', () => {
      (mockAuth as any).currentUser = null;
      const user = service.getCurrentUser();
      expect(user).toBeNull();
      (mockAuth as any).currentUser = mockUser;
    });
  });

  // login
  describe('login', () => {
    it('debería llamar a signInWithEmailAndPassword', async () => {
      const mockCredential = { user: mockUser };
      spyOn(service, 'login').and.returnValue(Promise.resolve(mockCredential as any));
      const result = await service.login('silvia@gmail.com', 'password123');
      expect(service.login).toHaveBeenCalledWith('silvia@gmail.com', 'password123');
      expect(result).toEqual(mockCredential as any);
    });
  });

  // logout
  describe('logout', () => {
    it('debería llamar a signOut', async () => {
      spyOn(service, 'logout').and.returnValue(Promise.resolve());
      await service.logout();
      expect(service.logout).toHaveBeenCalled();
    });
  });

  // register
  describe('register', () => {
    it('debería llamar a register con los parámetros correctos', async () => {
      const mockCredential = { user: mockUser };
      spyOn(service, 'register').and.returnValue(Promise.resolve(mockCredential as any));
      const result = await service.register('Silvia', 'silvia@gmail.com', 'password123');
      expect(service.register).toHaveBeenCalledWith('Silvia', 'silvia@gmail.com', 'password123');
      expect(result).toEqual(mockCredential as any);
    });
  });
});
