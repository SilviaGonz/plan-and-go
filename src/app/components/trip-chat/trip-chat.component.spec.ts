import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripChatComponent } from './trip-chat.component';
import { Auth } from '@angular/fire/auth';
import { ChatService } from '../../services/chat.service';
import { UiService } from '../../services/ui.service';
import { Message } from '../../models/message';
import { BehaviorSubject } from 'rxjs';

const mockMessages: Message[] = [
  {
    id: '1',
    travelId: 'travel-1',
    userId: 'user-1',
    userName: 'Silvia',
    text: 'Hola a todos!',
    createdAt: new Date('2026-07-01T10:00:00')
  },
  {
    id: '2',
    travelId: 'travel-1',
    userId: 'user-2',
    userName: 'Paula',
    text: 'Buenas! ¿Cuándo salimos?',
    createdAt: new Date('2026-07-01T10:05:00')
  },
  {
    id: '3',
    travelId: 'travel-1',
    userId: 'user-1',
    userName: 'Silvia',
    text: 'El viernes por la mañana',
    createdAt: new Date('2026-07-01T10:10:00')
  }
];

const mockChatService = {
  listenMessages: jasmine.createSpy('listenMessages').and.callFake(
    (travelId: string, callback: (messages: Message[]) => void) => {
      callback(mockMessages);
      return () => {};
    }
  ),
  sendMessage: jasmine.createSpy('sendMessage').and.returnValue(Promise.resolve())
};

const mockAuth = {
  currentUser: { uid: 'user-1', email: 'silvia@gmail.com' }
};

const searchQuery$ = new BehaviorSubject<string>('');
const mockUiService = {
  searchQuery: searchQuery$.asObservable()
};

describe('TripChatComponent', () => {
  let component: TripChatComponent;
  let fixture: ComponentFixture<TripChatComponent>;

  beforeEach(async () => {
    searchQuery$.next('');
    mockChatService.listenMessages.calls.reset();
    mockChatService.sendMessage.calls.reset();

    await TestBed.configureTestingModule({
      imports: [TripChatComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: ChatService, useValue: mockChatService },
        { provide: UiService, useValue: mockUiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TripChatComponent);
    component = fixture.componentInstance;
    component.travelId = 'travel-1';
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener newMessage vacío por defecto', () => {
      expect(component.newMessage).toBe('');
    });

    it('debería tener searchQuery vacío por defecto', () => {
      expect(component.searchQuery).toBe('');
    });

    it('debería recibir travelId correctamente', () => {
      expect(component.travelId).toBe('travel-1');
    });

    it('debería cargar los mensajes al inicializar', () => {
      expect(component.messages.length).toBe(3);
    });
  });

  // currentUserId getter
  describe('currentUserId', () => {
    it('debería devolver el uid del usuario actual', () => {
      expect(component.currentUserId).toBe('user-1');
    });

it('debería devolver cadena vacía si no hay usuario', () => {
  (mockAuth as any).currentUser = null;
  expect(component.currentUserId).toBe('');
  (mockAuth as any).currentUser = { uid: 'user-1', email: 'silvia@gmail.com' };
});
  });

  // filteredMessages getter
  describe('filteredMessages', () => {
    it('debería devolver todos los mensajes si searchQuery está vacío', () => {
      component.searchQuery = '';
      expect(component.filteredMessages.length).toBe(3);
    });

    it('debería filtrar por texto del mensaje', () => {
      component.searchQuery = 'hola';
      expect(component.filteredMessages.length).toBe(1);
      expect(component.filteredMessages[0].text).toBe('Hola a todos!');
    });

    it('debería filtrar por nombre de usuario', () => {
      component.searchQuery = 'paula';
      expect(component.filteredMessages.length).toBe(1);
      expect(component.filteredMessages[0].userName).toBe('Paula');
    });

    it('debería ser insensible a mayúsculas', () => {
      component.searchQuery = 'SILVIA';
      expect(component.filteredMessages.length).toBe(2);
    });

    it('debería devolver vacío si no hay coincidencias', () => {
      component.searchQuery = 'xyz123';
      expect(component.filteredMessages.length).toBe(0);
    });

    it('debería devolver todos los mensajes si searchQuery tiene solo espacios', () => {
      component.searchQuery = '   ';
      expect(component.filteredMessages.length).toBe(3);
    });

    it('debería filtrar por texto parcial', () => {
      component.searchQuery = 'viern';
      expect(component.filteredMessages.length).toBe(1);
    });

    it('debería encontrar mensajes de múltiples usuarios con el mismo texto', () => {
      component.searchQuery = 'salimos';
      expect(component.filteredMessages.length).toBe(1);
    });
  });

  // send
  describe('send', () => {
    it('no debería enviar si newMessage está vacío', async () => {
      component.newMessage = '';
      await component.send();
      expect(mockChatService.sendMessage).not.toHaveBeenCalled();
    });

    it('no debería enviar si newMessage tiene solo espacios', async () => {
      component.newMessage = '   ';
      await component.send();
      expect(mockChatService.sendMessage).not.toHaveBeenCalled();
    });

    it('debería enviar el mensaje si newMessage tiene texto', async () => {
      component.newMessage = 'Hola!';
      await component.send();
      expect(mockChatService.sendMessage).toHaveBeenCalledWith('travel-1', 'Hola!');
    });

    it('debería limpiar newMessage tras enviar', async () => {
      component.newMessage = 'Hola!';
      await component.send();
      expect(component.newMessage).toBe('');
    });

    it('debería enviar el mensaje sin espacios al inicio y al final', async () => {
      component.newMessage = '  Hola!  ';
      await component.send();
      expect(mockChatService.sendMessage).toHaveBeenCalledWith('travel-1', 'Hola!');
    });
  });

  // onKeydown
  describe('onKeydown', () => {
    it('debería enviar al pulsar Enter', async () => {
      component.newMessage = 'Mensaje de prueba';
      spyOn(component, 'send');
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
      component.onKeydown(event);
      expect(component.send).toHaveBeenCalled();
    });

    it('no debería enviar al pulsar Shift+Enter', () => {
      component.newMessage = 'Mensaje de prueba';
      spyOn(component, 'send');
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      component.onKeydown(event);
      expect(component.send).not.toHaveBeenCalled();
    });

    it('no debería enviar al pulsar otra tecla', () => {
      spyOn(component, 'send');
      const event = new KeyboardEvent('keydown', { key: 'A', shiftKey: false });
      component.onKeydown(event);
      expect(component.send).not.toHaveBeenCalled();
    });
  });

  // formatDate
  describe('formatDate', () => {
    it('debería formatear la fecha correctamente', () => {
      const date = new Date('2026-07-01T10:00:00');
      const result = component.formatDate(date);
      expect(result).toContain('01/07/2026');
      expect(result).toContain('10:00');
    });

    it('debería devolver un string no vacío', () => {
      const result = component.formatDate(new Date());
      expect(result.length).toBeGreaterThan(0);
    });

    it('debería incluir hora y minutos', () => {
      const date = new Date('2026-07-01T15:30:00');
      const result = component.formatDate(date);
      expect(result).toContain('15:30');
    });

    it('debería incluir el año', () => {
      const date = new Date('2026-07-01T10:00:00');
      const result = component.formatDate(date);
      expect(result).toContain('2026');
    });
  });

  // UiService searchQuery
  describe('UiService searchQuery', () => {
    it('debería actualizar searchQuery cuando cambia en UiService', () => {
      searchQuery$.next('hola');
      expect(component.searchQuery).toBe('hola');
    });

    it('debería limpiar searchQuery cuando UiService lo limpia', () => {
      searchQuery$.next('hola');
      searchQuery$.next('');
      expect(component.searchQuery).toBe('');
    });
  });
});
