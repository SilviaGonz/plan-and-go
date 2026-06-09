import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProposeActivityModalComponent } from './propose-activity-modal.component';
import { ActivityService } from '../../services/activity.service';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';

const mockActivityService = {
  createActivity: jasmine.createSpy('createActivity').and.returnValue(Promise.resolve())
};

const mockAuth = {
  currentUser: { uid: 'user-1', displayName: 'Test User', email: 'test@test.com' }
};

const mockStorage = {};

describe('ProposeActivityModalComponent', () => {
  let component: ProposeActivityModalComponent;
  let fixture: ComponentFixture<ProposeActivityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposeActivityModalComponent],
      providers: [
        { provide: ActivityService, useValue: mockActivityService },
        { provide: Auth, useValue: mockAuth },
        { provide: Storage, useValue: mockStorage }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProposeActivityModalComponent);
    component = fixture.componentInstance;
    component.travelId = 'travel-1';
    component.travelName = 'Viaje a Tenerife';
    component.minDate = '2026-07-01';
    component.maxDate = '2026-07-07';
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener valores por defecto correctos', () => {
      expect(component.selectedIcon).toBe('bi-compass');
      expect(component.imageUrls).toEqual([]);
      expect(component.uploadingImage).toBeFalse();
      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe('');
    });

    it('debería tener 7 iconos de actividad', () => {
      expect(component.activityIcons.length).toBe(7);
    });

    it('debería recibir travelId correctamente', () => {
      expect(component.travelId).toBe('travel-1');
    });

    it('debería recibir travelName correctamente', () => {
      expect(component.travelName).toBe('Viaje a Tenerife');
    });

    it('debería recibir minDate correctamente', () => {
      expect(component.minDate).toBe('2026-07-01');
    });

    it('debería recibir maxDate correctamente', () => {
      expect(component.maxDate).toBe('2026-07-07');
    });
  });

  // Formulario
  describe('Formulario', () => {
    it('debería ser inválido si está vacío', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('debería ser válido con todos los campos requeridos', () => {
      component.form.patchValue({
        title: 'Visita al Teide',
        activityLevel: 'bajo',
        location: 'Teide, Tenerife',
        suggestedDate: '2026-07-03',
        startTime: '09:00',
        duration: '1 hora'
      });
      expect(component.form.valid).toBeTrue();
    });

    it('debería ser inválido sin título', () => {
      component.form.patchValue({
        title: '',
        activityLevel: 'bajo',
        location: 'Teide',
        suggestedDate: '2026-07-03',
        startTime: '09:00',
        duration: '1 hora'
      });
      expect(component.form.invalid).toBeTrue();
    });

    it('debería ser inválido sin location', () => {
      component.form.patchValue({
        title: 'Visita',
        activityLevel: 'bajo',
        location: '',
        suggestedDate: '2026-07-03',
        startTime: '09:00',
        duration: '1 hora'
      });
      expect(component.form.invalid).toBeTrue();
    });

    it('debería ser inválido sin suggestedDate', () => {
      component.form.patchValue({
        title: 'Visita',
        activityLevel: 'bajo',
        location: 'Teide',
        suggestedDate: '',
        startTime: '09:00',
        duration: '1 hora'
      });
      expect(component.form.invalid).toBeTrue();
    });

    it('debería ser inválido sin startTime', () => {
      component.form.patchValue({
        title: 'Visita',
        activityLevel: 'bajo',
        location: 'Teide',
        suggestedDate: '2026-07-03',
        startTime: '',
        duration: '1 hora'
      });
      expect(component.form.invalid).toBeTrue();
    });

    it('debería tener activityLevel bajo por defecto', () => {
      expect(component.form.get('activityLevel')?.value).toBe('bajo');
    });

    it('debería tener duration 1 hora por defecto', () => {
      expect(component.form.get('duration')?.value).toBe('1 hora');
    });

    it('debería tener costPerPerson 0 por defecto', () => {
      expect(component.form.get('costPerPerson')?.value).toBe(0);
    });

    it('debería tener requiresReservation false por defecto', () => {
      expect(component.form.get('requiresReservation')?.value).toBeFalse();
    });
  });

  // Getters de FormControl
  describe('Getters de FormControl', () => {
    it('debería devolver titleControl', () => {
      expect(component.titleControl).toBeTruthy();
    });

    it('debería devolver descriptionControl', () => {
      expect(component.descriptionControl).toBeTruthy();
    });

    it('debería devolver locationControl', () => {
      expect(component.locationControl).toBeTruthy();
    });

    it('debería devolver linkControl', () => {
      expect(component.linkControl).toBeTruthy();
    });

    it('debería devolver suggestedDateControl', () => {
      expect(component.suggestedDateControl).toBeTruthy();
    });

    it('debería devolver startTimeControl', () => {
      expect(component.startTimeControl).toBeTruthy();
    });

    it('debería devolver costPerPersonControl', () => {
      expect(component.costPerPersonControl).toBeTruthy();
    });

    it('debería devolver notesControl', () => {
      expect(component.notesControl).toBeTruthy();
    });
  });

  // removeImage
  describe('removeImage', () => {
    it('debería eliminar una imagen de la lista', () => {
      component.imageUrls = ['url1', 'url2', 'url3'];
      component.removeImage('url2');
      expect(component.imageUrls).toEqual(['url1', 'url3']);
    });

    it('debería eliminar la primera imagen', () => {
      component.imageUrls = ['url1', 'url2'];
      component.removeImage('url1');
      expect(component.imageUrls).toEqual(['url2']);
    });

    it('debería eliminar la última imagen', () => {
      component.imageUrls = ['url1', 'url2'];
      component.removeImage('url2');
      expect(component.imageUrls).toEqual(['url1']);
    });

    it('no debería modificar la lista si la url no existe', () => {
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

  // EventEmitters
  describe('EventEmitters', () => {
    it('debería emitir close', () => {
      spyOn(component.close, 'emit');
      component.close.emit();
      expect(component.close.emit).toHaveBeenCalled();
    });

    it('debería emitir created', () => {
      spyOn(component.created, 'emit');
      component.created.emit();
      expect(component.created.emit).toHaveBeenCalled();
    });
  });

  // onSubmit
  describe('onSubmit', () => {
    it('no debería enviar si el formulario es inválido', async () => {
      spyOn(component.created, 'emit');
      await component.onSubmit();
      expect(component.created.emit).not.toHaveBeenCalled();
    });

    it('debería marcar todos los campos como touched si el formulario es inválido', async () => {
      await component.onSubmit();
      expect(component.form.touched).toBeTrue();
    });

    it('debería llamar a createActivity si el formulario es válido', async () => {
      component.form.patchValue({
        title: 'Visita al Teide',
        activityLevel: 'bajo',
        location: 'Teide',
        suggestedDate: '2026-07-03',
        startTime: '09:00',
        duration: '1 hora'
      });
      await component.onSubmit();
      expect(mockActivityService.createActivity).toHaveBeenCalled();
    });
  });
});
