import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProposeTravelModalComponent } from './propose-travel-modal.component';
import { TravelService } from '../../services/travel.service';
import { Storage } from '@angular/fire/storage';
import { Travel } from '../../models/travel';

const mockTravelService = {
  createTravel: jasmine.createSpy('createTravel').and.returnValue(Promise.resolve('new-travel-id')),
  updateTravel: jasmine.createSpy('updateTravel').and.returnValue(Promise.resolve())
};

const mockStorage = {};

const mockTravel: Travel = {
  id: 'travel-1',
  icon: 'bi-airplane',
  name: 'Viaje a Tenerife',
  description: 'Un viaje increíble',
  startDate: new Date('2026-07-01'),
  endDate: new Date('2026-07-07'),
  itineraryType: 'manual',
  membersCount: 3,
  members: [
    { email: 'prueba1@gmail.com', status: 'accepted' },
    { email: 'prueba2@gmail.com', status: 'pending' }
  ],
  images: ['https://imagen1.jpg'],
  notes: 'Notas del viaje',
  createdBy: 'user-1',
  createdAt: new Date(),
  itinerary: []
};

describe('ProposeTravelModalComponent', () => {
  let component: ProposeTravelModalComponent;
  let fixture: ComponentFixture<ProposeTravelModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposeTravelModalComponent],
      providers: [
        { provide: TravelService, useValue: mockTravelService },
        { provide: Storage, useValue: mockStorage }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProposeTravelModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener valores por defecto correctos', () => {
      expect(component.selectedIcon).toBe('bi-compass');
      expect(component.selectedItinerary).toBe('');
      expect(component.members).toEqual([]);
      expect(component.memberEmail).toBe('');
      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe('');
      expect(component.imageUrls).toEqual([]);
      expect(component.uploadingImage).toBeFalse();
      expect(component.manualItinerary).toEqual([]);
      expect(component.aiItinerary).toEqual([]);
    });

    it('debería tener isEditMode false por defecto', () => {
      expect(component.isEditMode).toBeFalse();
    });

    it('debería tener travelId null por defecto', () => {
      expect(component.travelId).toBeNull();
    });
  });

  // tripDuration getter
  describe('tripDuration', () => {
    it('debería devolver cadena vacía si no hay fechas', () => {
      expect(component.tripDuration).toBe('');
    });

    it('debería devolver cadena vacía si solo hay fecha de inicio', () => {
      component.form.patchValue({ startDate: '2026-07-01', endDate: '' });
      expect(component.tripDuration).toBe('');
    });

    it('debería devolver cadena vacía si solo hay fecha de fin', () => {
      component.form.patchValue({ startDate: '', endDate: '2026-07-07' });
      expect(component.tripDuration).toBe('');
    });

    it('debería calcular correctamente la duración de 7 días', () => {
      component.form.patchValue({ startDate: '2026-07-01', endDate: '2026-07-07' });
      expect(component.tripDuration).toContain('6 días');
      expect(component.tripDuration).toContain('5 noches');
    });

    it('debería calcular correctamente la duración de 1 día', () => {
      component.form.patchValue({ startDate: '2026-07-01', endDate: '2026-07-02' });
      expect(component.tripDuration).toContain('1 días');
      expect(component.tripDuration).toContain('0 noches');
    });

    it('debería devolver cadena vacía si endDate es igual a startDate', () => {
      component.form.patchValue({ startDate: '2026-07-01', endDate: '2026-07-01' });
      expect(component.tripDuration).toBe('');
    });

    it('debería devolver cadena vacía si endDate es anterior a startDate', () => {
      component.form.patchValue({ startDate: '2026-07-07', endDate: '2026-07-01' });
      expect(component.tripDuration).toBe('');
    });

    it('debería incluir el texto "Duración total del viaje"', () => {
      component.form.patchValue({ startDate: '2026-07-01', endDate: '2026-07-07' });
      expect(component.tripDuration).toContain('Duración total del viaje');
    });
  });

  // isValidEmail
  describe('isValidEmail', () => {
    it('debería validar un email correcto', () => {
      expect(component.isValidEmail('test@gmail.com')).toBeTrue();
    });

    it('debería invalidar un email sin @', () => {
      expect(component.isValidEmail('testgmail.com')).toBeFalse();
    });

    it('debería invalidar un email sin dominio', () => {
      expect(component.isValidEmail('test@')).toBeFalse();
    });

    it('debería invalidar un email vacío', () => {
      expect(component.isValidEmail('')).toBeFalse();
    });

    it('debería invalidar un email con espacios', () => {
      expect(component.isValidEmail('test @gmail.com')).toBeFalse();
    });

    it('debería validar un email con subdominio', () => {
      expect(component.isValidEmail('test@mail.gmail.com')).toBeTrue();
    });

    it('debería invalidar un email sin extensión', () => {
      expect(component.isValidEmail('test@gmail')).toBeFalse();
    });
  });

  // addMember
  describe('addMember', () => {
    it('no debería añadir si el email está vacío', () => {
      component.memberEmail = '';
      component.addMember();
      expect(component.members.length).toBe(0);
    });

    it('debería añadir un email válido', () => {
      component.memberEmail = 'nuevo@gmail.com';
      component.addMember();
      expect(component.members).toContain('nuevo@gmail.com');
    });

    it('debería limpiar memberEmail tras añadir', () => {
      component.memberEmail = 'nuevo@gmail.com';
      component.addMember();
      expect(component.memberEmail).toBe('');
    });

    it('debería mostrar error si el email es inválido', () => {
      component.memberEmail = 'emailinvalido';
      component.addMember();
      expect(component.memberEmailError).toBe('Introduce un email válido');
    });

    it('debería mostrar error si el email ya fue añadido', () => {
      component.members = ['test@gmail.com'];
      component.memberEmail = 'test@gmail.com';
      component.addMember();
      expect(component.memberEmailError).toBe('Este email ya ha sido añadido');
    });

    it('no debería duplicar miembros', () => {
      component.memberEmail = 'test@gmail.com';
      component.addMember();
      component.memberEmail = 'test@gmail.com';
      component.addMember();
      expect(component.members.filter(m => m === 'test@gmail.com').length).toBe(1);
    });

    it('debería limpiar el error tras añadir correctamente', () => {
      component.memberEmailError = 'Error previo';
      component.memberEmail = 'nuevo@gmail.com';
      component.addMember();
      expect(component.memberEmailError).toBe('');
    });

    it('debería poder añadir múltiples miembros', () => {
      component.memberEmail = 'uno@gmail.com';
      component.addMember();
      component.memberEmail = 'dos@gmail.com';
      component.addMember();
      expect(component.members.length).toBe(2);
    });
  });

  // removeMember
  describe('removeMember', () => {
    it('debería eliminar un miembro', () => {
      component.members = ['uno@gmail.com', 'dos@gmail.com'];
      component.removeMember('uno@gmail.com');
      expect(component.members).toEqual(['dos@gmail.com']);
    });

    it('no debería modificar la lista si el email no existe', () => {
      component.members = ['uno@gmail.com'];
      component.removeMember('noexiste@gmail.com');
      expect(component.members).toEqual(['uno@gmail.com']);
    });

    it('debería dejar la lista vacía si solo había un miembro', () => {
      component.members = ['uno@gmail.com'];
      component.removeMember('uno@gmail.com');
      expect(component.members).toEqual([]);
    });

    it('debería eliminar solo el miembro correcto', () => {
      component.members = ['uno@gmail.com', 'dos@gmail.com', 'tres@gmail.com'];
      component.removeMember('dos@gmail.com');
      expect(component.members).toEqual(['uno@gmail.com', 'tres@gmail.com']);
    });
  });

  // removeImage
  describe('removeImage', () => {
    it('debería eliminar una imagen', () => {
      component.imageUrls = ['url1', 'url2', 'url3'];
      component.removeImage('url2');
      expect(component.imageUrls).toEqual(['url1', 'url3']);
    });

    it('no debería modificar si la url no existe', () => {
      component.imageUrls = ['url1', 'url2'];
      component.removeImage('url3');
      expect(component.imageUrls).toEqual(['url1', 'url2']);
    });

    it('debería dejar la lista vacía si solo había una imagen', () => {
      component.imageUrls = ['url1'];
      component.removeImage('url1');
      expect(component.imageUrls).toEqual([]);
    });
  });

  // isEditMode
  describe('isEditMode', () => {
    it('debería ser false si travelId es null', () => {
      component.travelId = null;
      expect(component.isEditMode).toBeFalse();
    });

    it('debería ser true si travelId tiene valor', () => {
      component.travelId = 'travel-1';
      expect(component.isEditMode).toBeTrue();
    });

    it('debería ser false si travelId es cadena vacía', () => {
      component.travelId = '';
      expect(component.isEditMode).toBeFalse();
    });
  });

  // travelData setter
  describe('travelData setter', () => {
    it('debería rellenar el formulario con los datos del viaje', () => {
      component.travelData = mockTravel;
      expect(component.form.get('name')?.value).toBe('Viaje a Tenerife');
      expect(component.form.get('description')?.value).toBe('Un viaje increíble');
      expect(component.form.get('membersCount')?.value).toBe(3);
      expect(component.form.get('notes')?.value).toBe('Notas del viaje');
    });

    it('debería establecer el icon del viaje', () => {
      component.travelData = mockTravel;
      expect(component.selectedIcon).toBe('bi-airplane');
    });

    it('debería establecer los miembros del viaje', () => {
      component.travelData = mockTravel;
      expect(component.members).toContain('prueba1@gmail.com');
      expect(component.members).toContain('prueba2@gmail.com');
    });

    it('debería establecer las imágenes del viaje', () => {
      component.travelData = mockTravel;
      expect(component.imageUrls).toEqual(['https://imagen1.jpg']);
    });

    it('debería convertir itineraryType ai a manual', () => {
      component.travelData = { ...mockTravel, itineraryType: 'ai' };
      expect(component.selectedItinerary).toBe('manual');
    });

    it('debería mantener itineraryType manual', () => {
      component.travelData = { ...mockTravel, itineraryType: 'manual' };
      expect(component.selectedItinerary).toBe('manual');
    });

    it('debería mantener itineraryType later', () => {
      component.travelData = { ...mockTravel, itineraryType: 'later' };
      expect(component.selectedItinerary).toBe('later');
    });

    it('no debería hacer nada si travel es null', () => {
      component.travelData = null;
      expect(component.form.get('name')?.value).toBe('');
    });
  });

  // Formulario
  describe('Formulario', () => {
    it('debería ser inválido si está vacío', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('debería ser válido con todos los campos requeridos', () => {
      component.form.patchValue({
        name: 'Viaje a Madrid',
        startDate: '2026-07-01',
        endDate: '2026-07-07',
        membersCount: 3
      });
      expect(component.form.valid).toBeTrue();
    });

    it('debería ser inválido sin nombre', () => {
      component.form.patchValue({
        name: '',
        startDate: '2026-07-01',
        endDate: '2026-07-07',
        membersCount: 3
      });
      expect(component.form.invalid).toBeTrue();
    });

    it('debería ser inválido sin fechas', () => {
      component.form.patchValue({
        name: 'Viaje',
        startDate: '',
        endDate: '',
        membersCount: 3
      });
      expect(component.form.invalid).toBeTrue();
    });

    it('debería ser inválido con membersCount 0', () => {
      component.form.patchValue({
        name: 'Viaje',
        startDate: '2026-07-01',
        endDate: '2026-07-07',
        membersCount: 0
      });
      expect(component.form.invalid).toBeTrue();
    });
  });

  // onSubmit
  describe('onSubmit', () => {
    it('no debería enviar si el formulario es inválido', async () => {
      spyOn(component.created, 'emit');
      await component.onSubmit();
      expect(component.created.emit).not.toHaveBeenCalled();
    });

    it('no debería enviar si no hay itinerario seleccionado', async () => {
      spyOn(component.created, 'emit');
      component.form.patchValue({
        name: 'Viaje',
        startDate: '2026-07-01',
        endDate: '2026-07-07',
        membersCount: 3
      });
      component.selectedItinerary = '';
      await component.onSubmit();
      expect(component.created.emit).not.toHaveBeenCalled();
    });

    it('debería llamar a createTravel en modo creación', async () => {
      component.form.patchValue({
        name: 'Viaje',
        startDate: '2026-07-01',
        endDate: '2026-07-07',
        membersCount: 3
      });
      component.selectedItinerary = 'later';
      await component.onSubmit();
      expect(mockTravelService.createTravel).toHaveBeenCalled();
    });

    it('debería llamar a updateTravel en modo edición', async () => {
      component.travelId = 'travel-1';
      component.form.patchValue({
        name: 'Viaje',
        startDate: '2026-07-01',
        endDate: '2026-07-07',
        membersCount: 3
      });
      component.selectedItinerary = 'later';
      await component.onSubmit();
      expect(mockTravelService.updateTravel).toHaveBeenCalled();
    });
  });

  // EventEmitters
  describe('EventEmitters', () => {
    it('debería emitir close', () => {
      spyOn(component.close, 'emit');
      component.close.emit();
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('debería emitir created con un id', () => {
      spyOn(component.created, 'emit');
      component.created.emit('travel-1');
      expect(component.created.emit).toHaveBeenCalledWith('travel-1');
    });
  });
});
