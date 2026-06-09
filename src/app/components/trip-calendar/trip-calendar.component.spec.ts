import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripCalendarComponent } from './trip-calendar.component';
import { Travel } from '../../models/travel';

const mockTravel: Travel = {
  id: 'travel-1',
  icon: 'bi-compass',
  name: 'Viaje a Tenerife',
  description: 'Un viaje de prueba',
  startDate: new Date('2026-07-01'),
  endDate: new Date('2026-07-07'),
  itineraryType: 'manual',
  membersCount: 3,
  members: [],
  images: [],
  notes: '',
  createdBy: 'user-1',
  createdAt: new Date(),
  itinerary: [
    {
      date: new Date('2026-07-01'),
      label: 'Miércoles, 1 de julio de 2026',
      activities: [{ name: 'Visita al Teide', time: '10:00' }]
    },
    {
      date: new Date('2026-07-02'),
      label: 'Jueves, 2 de julio de 2026',
      activities: [{ name: 'Siam Park', time: '11:00' }]
    }
  ]
};

describe('TripCalendarComponent', () => {
  let component: TripCalendarComponent;
  let fixture: ComponentFixture<TripCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripCalendarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TripCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener selectedDay null por defecto', () => {
      expect(component.selectedDay).toBeNull();
    });

    it('debería tener 7 días de la semana', () => {
      expect(component.weekDays.length).toBe(7);
    });

    it('debería tener los días de la semana correctos', () => {
      expect(component.weekDays).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
    });

    it('debería tener weeks vacío sin viaje', () => {
      expect(component.weeks).toEqual([]);
    });
  });

  // monthLabel getter
  describe('monthLabel', () => {
    it('debería devolver el mes y año correctamente', () => {
      component.currentMonth = 6;
      component.currentYear = 2026;
      expect(component.monthLabel).toContain('Julio');
      expect(component.monthLabel).toContain('2026');
    });

    it('debería empezar con mayúscula', () => {
      component.currentMonth = 0;
      component.currentYear = 2026;
      const label = component.monthLabel;
      expect(label.charAt(0)).toBe(label.charAt(0).toUpperCase());
    });

    it('debería devolver enero correctamente', () => {
      component.currentMonth = 0;
      component.currentYear = 2026;
      expect(component.monthLabel).toContain('Enero');
    });

    it('debería devolver diciembre correctamente', () => {
      component.currentMonth = 11;
      component.currentYear = 2026;
      expect(component.monthLabel).toContain('Diciembre');
    });
  });

  // ngOnChanges
  describe('ngOnChanges', () => {
    it('debería actualizar el mes al recibir el viaje', () => {
      component.travel = mockTravel;
      component.ngOnChanges({
        travel: { currentValue: mockTravel, previousValue: null, firstChange: true, isFirstChange: () => true }
      });
      expect(component.currentMonth).toBe(6); // julio = 6
    });

    it('debería actualizar el año al recibir el viaje', () => {
      component.travel = mockTravel;
      component.ngOnChanges({
        travel: { currentValue: mockTravel, previousValue: null, firstChange: true, isFirstChange: () => true }
      });
      expect(component.currentYear).toBe(2026);
    });

    it('debería construir el calendario al recibir el viaje', () => {
      component.travel = mockTravel;
      component.ngOnChanges({
        travel: { currentValue: mockTravel, previousValue: null, firstChange: true, isFirstChange: () => true }
      });
      expect(component.weeks.length).toBeGreaterThan(0);
    });

    it('no debería construir el calendario si travel es null', () => {
      component.travel = null;
      component.ngOnChanges({
        travel: { currentValue: null, previousValue: null, firstChange: true, isFirstChange: () => true }
      });
      expect(component.weeks).toEqual([]);
    });
  });

  // buildCalendar
  describe('buildCalendar con viaje', () => {
    beforeEach(() => {
      component.travel = mockTravel;
      component.ngOnChanges({
        travel: { currentValue: mockTravel, previousValue: null, firstChange: true, isFirstChange: () => true }
      });
    });

    it('debería generar semanas', () => {
      expect(component.weeks.length).toBeGreaterThan(0);
    });

    it('cada semana debería tener 7 días', () => {
      component.weeks.forEach(week => {
        expect(week.length).toBe(7);
      });
    });

    it('debería marcar los días del viaje como isTripDay', () => {
      const allDays = component.weeks.flat();
      const tripDays = allDays.filter(d => d.isTripDay);
      expect(tripDays.length).toBe(7);
    });

    it('debería incluir el itinerario en los días correspondientes', () => {
      const allDays = component.weeks.flat();
      const dayWithItinerary = allDays.find(d =>
        d.isTripDay && d.itinerary !== undefined
      );
      expect(dayWithItinerary).toBeTruthy();
    });

    it('debería tener el número correcto de semanas para julio 2026', () => {
      expect(component.weeks.length).toBe(5);
    });
  });

  // prevMonth
  describe('prevMonth', () => {
    it('debería retroceder un mes', () => {
      component.currentMonth = 6;
      component.currentYear = 2026;
      component.prevMonth();
      expect(component.currentMonth).toBe(5);
      expect(component.currentYear).toBe(2026);
    });

    it('debería ir a diciembre del año anterior desde enero', () => {
      component.currentMonth = 0;
      component.currentYear = 2026;
      component.prevMonth();
      expect(component.currentMonth).toBe(11);
      expect(component.currentYear).toBe(2025);
    });

    it('debería reconstruir el calendario al retroceder', () => {
      component.travel = mockTravel;
      component.ngOnChanges({
        travel: { currentValue: mockTravel, previousValue: null, firstChange: true, isFirstChange: () => true }
      });
      component.prevMonth();
      expect(component.weeks.length).toBeGreaterThan(0);
    });
  });

  // nextMonth
  describe('nextMonth', () => {
    it('debería avanzar un mes', () => {
      component.currentMonth = 6;
      component.currentYear = 2026;
      component.nextMonth();
      expect(component.currentMonth).toBe(7);
      expect(component.currentYear).toBe(2026);
    });

    it('debería ir a enero del año siguiente desde diciembre', () => {
      component.currentMonth = 11;
      component.currentYear = 2026;
      component.nextMonth();
      expect(component.currentMonth).toBe(0);
      expect(component.currentYear).toBe(2027);
    });

    it('debería reconstruir el calendario al avanzar', () => {
      component.travel = mockTravel;
      component.ngOnChanges({
        travel: { currentValue: mockTravel, previousValue: null, firstChange: true, isFirstChange: () => true }
      });
      component.nextMonth();
      expect(component.weeks.length).toBeGreaterThan(0);
    });
  });

  // selectDay
  describe('selectDay', () => {
    beforeEach(() => {
      component.travel = mockTravel;
      component.ngOnChanges({
        travel: { currentValue: mockTravel, previousValue: null, firstChange: true, isFirstChange: () => true }
      });
    });

    it('debería seleccionar un día del viaje', () => {
      const tripDay = component.weeks.flat().find(d => d.isTripDay)!;
      component.selectDay(tripDay);
      expect(component.selectedDay).toEqual(tripDay);
    });

    it('debería deseleccionar un día si se pulsa dos veces', () => {
      const tripDay = component.weeks.flat().find(d => d.isTripDay)!;
      component.selectDay(tripDay);
      component.selectDay(tripDay);
      expect(component.selectedDay).toBeNull();
    });

    it('no debería seleccionar un día que no es del viaje', () => {
      const nonTripDay = component.weeks.flat().find(d => !d.isTripDay)!;
      component.selectDay(nonTripDay);
      expect(component.selectedDay).toBeNull();
    });

    it('debería limpiar selectedDay al pulsar un día no del viaje', () => {
      const tripDay = component.weeks.flat().find(d => d.isTripDay)!;
      component.selectDay(tripDay);
      expect(component.selectedDay).not.toBeNull();

      const nonTripDay = component.weeks.flat().find(d => !d.isTripDay)!;
      component.selectDay(nonTripDay);
      expect(component.selectedDay).toBeNull();
    });

    it('debería cambiar el día seleccionado al pulsar otro día del viaje', () => {
      const tripDays = component.weeks.flat().filter(d => d.isTripDay);
      component.selectDay(tripDays[0]);
      expect(component.selectedDay?.date.toDateString()).toBe(tripDays[0].date.toDateString());
      component.selectDay(tripDays[1]);
      expect(component.selectedDay?.date.toDateString()).toBe(tripDays[1].date.toDateString());
    });
  });
});
