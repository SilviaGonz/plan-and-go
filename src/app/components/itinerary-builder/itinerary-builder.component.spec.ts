import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItineraryBuilderComponent } from './itinerary-builder.component';
import { DayItinerary } from '../../models/travel';

describe('ItineraryBuilderComponent', () => {
  let component: ItineraryBuilderComponent;
  let fixture: ComponentFixture<ItineraryBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItineraryBuilderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ItineraryBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener días vacíos por defecto', () => {
      expect(component.days).toEqual([]);
    });

    it('debería tener startDate vacío por defecto', () => {
      expect(component.startDate).toBe('');
    });

    it('debería tener endDate vacío por defecto', () => {
      expect(component.endDate).toBe('');
    });

    it('debería tener initialItinerary vacío por defecto', () => {
      expect(component.initialItinerary).toEqual([]);
    });
  });

  // buildDays
  describe('buildDays', () => {
    it('debería generar los días correctos entre dos fechas', () => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-03';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-03', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
      expect(component.days.length).toBe(3);
    });

    it('debería generar un solo día si inicio y fin son iguales', () => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-01';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
      expect(component.days.length).toBe(1);
    });

    it('no debería generar días si endDate es anterior a startDate', () => {
      component.startDate = '2026-07-05';
      component.endDate = '2026-07-01';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-05', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
      expect(component.days.length).toBe(0);
    });

    it('no debería generar días si startDate está vacío', () => {
      component.startDate = '';
      component.endDate = '2026-07-01';
      component.ngOnChanges({
        startDate: { currentValue: '', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
      expect(component.days.length).toBe(0);
    });

    it('no debería generar días si endDate está vacío', () => {
      component.startDate = '2026-07-01';
      component.endDate = '';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
      expect(component.days.length).toBe(0);
    });

    it('debería generar el label del día en español con mayúscula', () => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-01';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
      expect(component.days[0].label).toContain('julio');
      expect(component.days[0].label.charAt(0)).toBe(component.days[0].label.charAt(0).toUpperCase());
    });

    it('cada día debería tener una actividad por defecto', () => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-03';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-03', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
      component.days.forEach(day => {
        expect(day.activities.length).toBe(1);
        expect(day.activities[0].time).toBe('00:00');
      });
    });

    it('debería usar actividades del initialItinerary si existen', () => {
      const initialItinerary: DayItinerary[] = [{
        date: new Date('2026-07-01T00:00:00'),
        label: 'Miércoles, 1 de julio de 2026',
        activities: [{ name: 'Visita al museo', time: '10:00' }]
      }];
      component.initialItinerary = initialItinerary;
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-01';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
      expect(component.days[0].activities[0].name).toBe('Visita al museo');
      expect(component.days[0].activities[0].time).toBe('10:00');
    });

    it('debería generar 7 días para una semana completa', () => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-07';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-07', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
      expect(component.days.length).toBe(7);
    });
  });

  // addActivity
  describe('addActivity', () => {
    beforeEach(() => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-01';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
    });

    it('debería añadir una actividad al día', () => {
      const day = component.days[0];
      const initialCount = day.activities.length;
      component.addActivity(day);
      expect(day.activities.length).toBe(initialCount + 1);
    });

    it('la nueva actividad debería tener nombre vacío y hora 00:00', () => {
      const day = component.days[0];
      component.addActivity(day);
      const lastActivity = day.activities[day.activities.length - 1];
      expect(lastActivity.name).toBe('');
      expect(lastActivity.time).toBe('00:00');
    });

    it('debería emitir itineraryChange al añadir actividad', () => {
      spyOn(component.itineraryChange, 'emit');
      const day = component.days[0];
      component.addActivity(day);
      expect(component.itineraryChange.emit).toHaveBeenCalled();
    });

    it('debería poder añadir múltiples actividades', () => {
      const day = component.days[0];
      component.addActivity(day);
      component.addActivity(day);
      component.addActivity(day);
      expect(day.activities.length).toBe(4);
    });
  });

  // removeActivity
  describe('removeActivity', () => {
    beforeEach(() => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-01';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
    });

    it('debería eliminar una actividad del día', () => {
      const day = component.days[0];
      component.addActivity(day);
      const countBefore = day.activities.length;
      component.removeActivity(day, 0);
      expect(day.activities.length).toBe(countBefore - 1);
    });

    it('debería emitir itineraryChange al eliminar actividad', () => {
      spyOn(component.itineraryChange, 'emit');
      const day = component.days[0];
      component.removeActivity(day, 0);
      expect(component.itineraryChange.emit).toHaveBeenCalled();
    });

    it('debería eliminar la actividad correcta por índice', () => {
      const day = component.days[0];
      day.activities = [
        { name: 'Actividad 1', time: '09:00' },
        { name: 'Actividad 2', time: '12:00' },
        { name: 'Actividad 3', time: '15:00' }
      ];
      component.removeActivity(day, 1);
      expect(day.activities.length).toBe(2);
      expect(day.activities[0].name).toBe('Actividad 1');
      expect(day.activities[1].name).toBe('Actividad 3');
    });
  });

  // removeDay
  describe('removeDay', () => {
    beforeEach(() => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-03';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-03', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
    });

    it('debería eliminar un día correctamente', () => {
      const countBefore = component.days.length;
      component.removeDay(0);
      expect(component.days.length).toBe(countBefore - 1);
    });

    it('debería emitir itineraryChange al eliminar día', () => {
      spyOn(component.itineraryChange, 'emit');
      component.removeDay(0);
      expect(component.itineraryChange.emit).toHaveBeenCalled();
    });

    it('debería eliminar el día correcto por índice', () => {
      const secondDayLabel = component.days[1].label;
      component.removeDay(0);
      expect(component.days[0].label).toBe(secondDayLabel);
    });
  });

  // onInput
  describe('onInput', () => {
    it('debería emitir itineraryChange al llamar onInput', () => {
      spyOn(component.itineraryChange, 'emit');
      component.onInput();
      expect(component.itineraryChange.emit).toHaveBeenCalled();
    });

    it('debería emitir los días actuales al llamar onInput', () => {
      component.startDate = '2026-07-01';
      component.endDate = '2026-07-01';
      component.ngOnChanges({
        startDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true },
        endDate: { currentValue: '2026-07-01', previousValue: '', firstChange: true, isFirstChange: () => true }
      });
      spyOn(component.itineraryChange, 'emit');
      component.onInput();
      expect(component.itineraryChange.emit).toHaveBeenCalledWith(component.days);
    });
  });
});
