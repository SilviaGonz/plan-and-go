import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItineraryIaBuilderComponent } from './itinerary-ia-builder.component';

describe('ItineraryIaBuilderComponent', () => {
  let component: ItineraryIaBuilderComponent;
  let fixture: ComponentFixture<ItineraryIaBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryIaBuilderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ItineraryIaBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener valores por defecto correctos', () => {
      expect(component.startDate).toBe('');
      expect(component.endDate).toBe('');
      expect(component.travelName).toBe('');
      expect(component.activities).toEqual(['', '']);
      expect(component.priority).toBe('minimize-distance');
      expect(component.pace).toBe('moderate');
      expect(component.generating).toBeFalse();
      expect(component.generated).toBeFalse();
      expect(component.generatedItinerary).toEqual([]);
    });

    it('debería tener 4 pasos de carga', () => {
      expect(component.loadingSteps.length).toBe(4);
    });

    it('todos los pasos de carga deberían estar sin completar por defecto', () => {
      component.loadingSteps.forEach(step => {
        expect(step.done).toBeFalse();
      });
    });
  });

  // filledActivities getter
  describe('filledActivities', () => {
    it('debería devolver vacío si todas las actividades están vacías', () => {
      component.activities = ['', ''];
      expect(component.filledActivities.length).toBe(0);
    });

    it('debería filtrar actividades vacías', () => {
      component.activities = ['Visita al Teide', '', 'Siam Park', ''];
      expect(component.filledActivities.length).toBe(2);
    });

    it('debería incluir todas las actividades con texto', () => {
      component.activities = ['Actividad 1', 'Actividad 2', 'Actividad 3'];
      expect(component.filledActivities).toEqual(['Actividad 1', 'Actividad 2', 'Actividad 3']);
    });

    it('debería filtrar actividades con solo espacios', () => {
      component.activities = ['   ', 'Actividad válida', '  '];
      expect(component.filledActivities.length).toBe(1);
      expect(component.filledActivities[0]).toBe('Actividad válida');
    });

    it('debería devolver vacío si no hay actividades', () => {
      component.activities = [];
      expect(component.filledActivities.length).toBe(0);
    });
  });

  // dayCount getter
  describe('dayCount', () => {
    it('debería devolver 0 si no hay fechas', () => {
      component.startDate = '';
      component.endDate = '';
      expect(component.dayCount).toBe(0);
    });

    it('debería devolver 0 si falta startDate', () => {
      component.startDate = '';
      component.endDate = '2026-07-07';
      expect(component.dayCount).toBe(0);
    });

    it('debería devolver 0 si falta endDate', () => {
      component.startDate = '2026-07-01';
      component.endDate = '';
      expect(component.dayCount).toBe(0);
    });

    it('debería devolver 1 para un viaje de un solo día', () => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-01';
      expect(component.dayCount).toBe(1);
    });

    it('debería devolver 7 para una semana completa', () => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-07';
      expect(component.dayCount).toBe(7);
    });

    it('debería devolver 4 para un viaje de 4 días', () => {
      component.startDate = '2026-03-30';
      component.endDate = '2026-04-02';
      expect(component.dayCount).toBe(4);
    });

    it('debería calcular correctamente entre meses diferentes', () => {
      component.startDate = '2026-06-28';
      component.endDate = '2026-07-05';
      expect(component.dayCount).toBe(8);
    });
  });

  // addActivity
  describe('addActivity', () => {
    it('debería añadir una actividad vacía', () => {
      const countBefore = component.activities.length;
      component.addActivity();
      expect(component.activities.length).toBe(countBefore + 1);
    });

    it('la nueva actividad debería ser una cadena vacía', () => {
      component.addActivity();
      expect(component.activities[component.activities.length - 1]).toBe('');
    });

    it('debería poder añadir múltiples actividades', () => {
      component.activities = [];
      component.addActivity();
      component.addActivity();
      component.addActivity();
      expect(component.activities.length).toBe(3);
    });
  });

  // removeActivity
  describe('removeActivity', () => {
    it('debería eliminar una actividad por índice', () => {
      component.activities = ['Actividad 1', 'Actividad 2', 'Actividad 3'];
      component.removeActivity(1);
      expect(component.activities.length).toBe(2);
      expect(component.activities).toEqual(['Actividad 1', 'Actividad 3']);
    });

    it('debería eliminar la primera actividad', () => {
      component.activities = ['Actividad 1', 'Actividad 2'];
      component.removeActivity(0);
      expect(component.activities[0]).toBe('Actividad 2');
    });

    it('debería eliminar la última actividad', () => {
      component.activities = ['Actividad 1', 'Actividad 2'];
      component.removeActivity(1);
      expect(component.activities.length).toBe(1);
      expect(component.activities[0]).toBe('Actividad 1');
    });
  });

  // updateActivity
  describe('updateActivity', () => {
    it('debería actualizar una actividad por índice', () => {
      component.activities = ['', ''];
      component.updateActivity(0, 'Visita al Teide');
      expect(component.activities[0]).toBe('Visita al Teide');
    });

    it('debería actualizar la actividad correcta sin afectar a las demás', () => {
      component.activities = ['Actividad 1', 'Actividad 2', 'Actividad 3'];
      component.updateActivity(1, 'Actividad actualizada');
      expect(component.activities[0]).toBe('Actividad 1');
      expect(component.activities[1]).toBe('Actividad actualizada');
      expect(component.activities[2]).toBe('Actividad 3');
    });

    it('debería poder actualizar con cadena vacía', () => {
      component.activities = ['Actividad 1'];
      component.updateActivity(0, '');
      expect(component.activities[0]).toBe('');
    });
  });

  // trackByIndex
  describe('trackByIndex', () => {
    it('debería devolver el índice', () => {
      expect(component.trackByIndex(0)).toBe(0);
      expect(component.trackByIndex(5)).toBe(5);
      expect(component.trackByIndex(99)).toBe(99);
    });
  });

  // resetToForm
  describe('resetToForm', () => {
    it('debería resetear generated a false', () => {
      component.generated = true;
      component.resetToForm();
      expect(component.generated).toBeFalse();
    });

    it('debería resetear generating a false', () => {
      component.generating = true;
      component.resetToForm();
      expect(component.generating).toBeFalse();
    });

    it('debería resetear generatedItinerary a vacío', () => {
      component.generatedItinerary = [{
        date: new Date(),
        label: 'Test',
        activities: []
      }];
      component.resetToForm();
      expect(component.generatedItinerary).toEqual([]);
    });

    it('debería resetear todos los valores a la vez', () => {
      component.generated = true;
      component.generating = true;
      component.generatedItinerary = [{ date: new Date(), label: 'Test', activities: [] }];
      component.resetToForm();
      expect(component.generated).toBeFalse();
      expect(component.generating).toBeFalse();
      expect(component.generatedItinerary).toEqual([]);
    });
  });

  // generate
  describe('generate', () => {
    it('no debería generar si no hay actividades rellenas', async () => {
      component.activities = ['', ''];
      await component.generate();
      expect(component.generating).toBeFalse();
      expect(component.generated).toBeFalse();
    });
  });

  // priority y pace
  describe('priority y pace', () => {
    it('debería aceptar priority minimize-distance', () => {
      component.priority = 'minimize-distance';
      expect(component.priority).toBe('minimize-distance');
    });

    it('debería aceptar priority minimize-time', () => {
      component.priority = 'minimize-time';
      expect(component.priority).toBe('minimize-time');
    });

    it('debería aceptar pace relaxed', () => {
      component.pace = 'relaxed';
      expect(component.pace).toBe('relaxed');
    });

    it('debería aceptar pace moderate', () => {
      component.pace = 'moderate';
      expect(component.pace).toBe('moderate');
    });

    it('debería aceptar pace intense', () => {
      component.pace = 'intense';
      expect(component.pace).toBe('intense');
    });
  });
});
