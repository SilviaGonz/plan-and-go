import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { UiService } from '../../../services/ui.service';
import { TravelService } from '../../../services/travel.service';
import { ActivityService } from '../../../services/activity.service';
import { ExpenseService } from '../../../services/expense.service';
import { Travel } from '../../../models/travel';
import { BehaviorSubject, Subject } from 'rxjs';

const mockAuth = {
  currentUser: { uid: 'user-1', email: 'silvia@gmail.com', displayName: 'Silvia' }
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

const searchQuery$ = new BehaviorSubject<string>('');
const openModal$ = new Subject<void>();
const mockUiService = {
  searchQuery: searchQuery$.asObservable(),
  openProposeTravelModal: openModal$.asObservable(),
  setActiveTab: jasmine.createSpy('setActiveTab'),
  clearSearchQuery: jasmine.createSpy('clearSearchQuery')
};

const mockTravelService = {
  getUserTravels: jasmine.createSpy('getUserTravels').and.returnValue(Promise.resolve([])),
  getArchivedTravels: jasmine.createSpy('getArchivedTravels').and.returnValue(Promise.resolve([])),
  getNextTrip: jasmine.createSpy('getNextTrip').and.returnValue(null),
  getTravelById: jasmine.createSpy('getTravelById').and.returnValue(Promise.resolve(null)),
  deleteTravel: jasmine.createSpy('deleteTravel').and.returnValue(Promise.resolve()),
  archiveTravel: jasmine.createSpy('archiveTravel').and.returnValue(Promise.resolve()),
  restoreTravel: jasmine.createSpy('restoreTravel').and.returnValue(Promise.resolve())
};

const mockActivityService = {
  getPendingVotesCount: jasmine.createSpy('getPendingVotesCount').and.returnValue(Promise.resolve(0)),
  getActivities: jasmine.createSpy('getActivities').and.returnValue(Promise.resolve([]))
};

const mockExpenseService = {
  getExpenses: jasmine.createSpy('getExpenses').and.returnValue(Promise.resolve([]))
};

const today = new Date();
const future7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
const future30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
const past = new Date('2025-01-01');
const pastEnd = new Date('2025-01-07');

const mockTravels: Travel[] = [
  {
    id: 'travel-1',
    icon: 'bi-compass',
    name: 'Viaje a Tenerife',
    description: '',
    startDate: future7,
    endDate: new Date(future7.getTime() + 6 * 24 * 60 * 60 * 1000),
    itineraryType: 'manual',
    membersCount: 3,
    members: [
      { email: 'silvia@gmail.com', status: 'accepted' },
      { email: 'paula@gmail.com', status: 'accepted' }
    ],
    images: [],
    notes: '',
    createdBy: 'user-1',
    createdAt: new Date()
  },
  {
    id: 'travel-2',
    icon: 'bi-airplane',
    name: 'Viaje a Madrid',
    description: '',
    startDate: future30,
    endDate: new Date(future30.getTime() + 4 * 24 * 60 * 60 * 1000),
    itineraryType: 'later',
    membersCount: 2,
    members: [
      { email: 'silvia@gmail.com', status: 'accepted' },
      { email: 'juan@gmail.com', status: 'pending' }
    ],
    images: [],
    notes: '',
    createdBy: 'user-1',
    createdAt: new Date()
  },
  {
    id: 'travel-3',
    icon: 'bi-house',
    name: 'Viaje pasado',
    description: '',
    startDate: past,
    endDate: pastEnd,
    itineraryType: 'later',
    membersCount: 2,
    members: [],
    images: [],
    notes: '',
    createdBy: 'user-1',
    createdAt: new Date()
  }
];

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
        { provide: UiService, useValue: mockUiService },
        { provide: TravelService, useValue: mockTravelService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: ExpenseService, useValue: mockExpenseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // filteredTravels
  describe('filteredTravels', () => {
    beforeEach(() => {
      component.travels = mockTravels;
      searchQuery$.next('');
      component.searchQuery = '';
    });

    it('debería devolver todos los viajes si searchQuery está vacío', () => {
      expect(component.filteredTravels.length).toBe(3);
    });

    it('debería filtrar por nombre del viaje', () => {
      component.searchQuery = 'tenerife';
      expect(component.filteredTravels.length).toBe(1);
      expect(component.filteredTravels[0].name).toBe('Viaje a Tenerife');
    });

    it('debería filtrar por email de miembro', () => {
      component.searchQuery = 'paula';
      expect(component.filteredTravels.length).toBe(1);
      expect(component.filteredTravels[0].id).toBe('travel-1');
    });

    it('debería ser insensible a mayúsculas', () => {
      component.searchQuery = 'MADRID';
      expect(component.filteredTravels.length).toBe(1);
      expect(component.filteredTravels[0].name).toBe('Viaje a Madrid');
    });

    it('debería devolver vacío si no hay coincidencias', () => {
      component.searchQuery = 'xyz123';
      expect(component.filteredTravels.length).toBe(0);
    });

    it('debería devolver todos si searchQuery tiene solo espacios', () => {
      component.searchQuery = '   ';
      expect(component.filteredTravels.length).toBe(3);
    });

    it('debería filtrar por email parcial', () => {
      component.searchQuery = 'juan';
      expect(component.filteredTravels.length).toBe(1);
      expect(component.filteredTravels[0].id).toBe('travel-2');
    });

    it('debería encontrar múltiples viajes con el mismo miembro', () => {
      component.searchQuery = 'silvia';
      expect(component.filteredTravels.length).toBe(2);
    });
  });

  // daysUntilNextTrip
  describe('daysUntilNextTrip', () => {
    it('debería devolver 0 si no hay próximo viaje', () => {
      component.nextTrip = null;
      expect(component.daysUntilNextTrip).toBe(0);
    });

    it('debería calcular correctamente los días hasta el próximo viaje', () => {
      component.nextTrip = mockTravels[0];
      expect(component.daysUntilNextTrip).toBe(7);
    });

    it('debería devolver un número positivo para viajes futuros', () => {
      component.nextTrip = mockTravels[1];
      expect(component.daysUntilNextTrip).toBeGreaterThan(0);
    });

    it('debería redondear hacia arriba', () => {
      const tomorrow = new Date(today.getTime() + 25 * 60 * 60 * 1000);
      component.nextTrip = { ...mockTravels[0], startDate: tomorrow };
      expect(component.daysUntilNextTrip).toBe(2);
    });
  });

  // formattedDates
  describe('formattedDates', () => {
    it('debería devolver cadena vacía si no hay próximo viaje', () => {
      component.nextTrip = null;
      expect(component.formattedDates).toBe('');
    });

    it('debería formatear las fechas en español', () => {
      component.nextTrip = {
        ...mockTravels[0],
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-07')
      };
      const result = component.formattedDates;
      expect(result).toContain('julio');
      expect(result).toContain('2026');
      expect(result).toContain(' - ');
    });

    it('debería incluir la fecha de inicio y fin', () => {
      component.nextTrip = {
        ...mockTravels[0],
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-07')
      };
      const result = component.formattedDates;
      expect(result).toContain('1');
      expect(result).toContain('7');
    });

    it('debería devolver string no vacío si hay nextTrip', () => {
      component.nextTrip = mockTravels[0];
      expect(component.formattedDates.length).toBeGreaterThan(0);
    });
  });

  // activeTrips
  describe('activeTrips', () => {
    it('debería devolver 0 si no hay viajes', () => {
      component.travels = [];
      expect(component.activeTrips).toBe(0);
    });

    it('debería contar solo viajes con endDate en el futuro', () => {
      component.travels = mockTravels;
      expect(component.activeTrips).toBe(2);
    });

    it('debería devolver 0 si todos los viajes son pasados', () => {
      component.travels = [mockTravels[2]];
      expect(component.activeTrips).toBe(0);
    });

    it('debería contar correctamente con un solo viaje activo', () => {
      component.travels = [mockTravels[0]];
      expect(component.activeTrips).toBe(1);
    });

    it('debería actualizarse cuando cambian los viajes', () => {
      component.travels = mockTravels;
      expect(component.activeTrips).toBe(2);
      component.travels = [mockTravels[2]];
      expect(component.activeTrips).toBe(0);
    });
  });
});