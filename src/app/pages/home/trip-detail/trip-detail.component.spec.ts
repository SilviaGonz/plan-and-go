import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripDetailComponent } from './trip-detail.component';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { TravelService } from '../../../services/travel.service';
import { ActivityService } from '../../../services/activity.service';
import { ChatService } from '../../../services/chat.service';
import { UiService } from '../../../services/ui.service';
import { Storage } from '@angular/fire/storage';
import { Firestore } from '@angular/fire/firestore';
import { Activity } from '../../../models/activity';
import { Travel } from '../../../models/travel';
import { BehaviorSubject, Subject } from 'rxjs';

const mockAuth = {
  currentUser: { uid: 'user-1', email: 'silvia@gmail.com' }
};

const mockRoute = {
  snapshot: { paramMap: { get: () => 'travel-1' } },
  fragment: new Subject<string>()
};

const mockTravelService = {
  getTravelById: jasmine.createSpy('getTravelById').and.returnValue(Promise.resolve(null))
};

const mockActivityService = {
  getActivities: jasmine.createSpy('getActivities').and.returnValue(Promise.resolve([])),
  vote: jasmine.createSpy('vote').and.returnValue(Promise.resolve())
};

const mockChatService = {
  getUnreadCount: jasmine.createSpy('getUnreadCount').and.returnValue(Promise.resolve(0)),
  updateLastVisit: jasmine.createSpy('updateLastVisit').and.returnValue(Promise.resolve()),
  listenMessages: jasmine.createSpy('listenMessages').and.returnValue(() => {})
};

const searchQuery$ = new BehaviorSubject<string>('');
const activeTab$ = new BehaviorSubject<string>('');
const mockUiService = {
  searchQuery: searchQuery$.asObservable(),
  activeTab: activeTab$.asObservable(),
  setActiveTab: jasmine.createSpy('setActiveTab'),
  clearSearchQuery: jasmine.createSpy('clearSearchQuery'),
  setSearchQuery: jasmine.createSpy('setSearchQuery'),
  triggerProposeTravelModal: jasmine.createSpy('triggerProposeTravelModal'),
  openProposeTravelModal: new Subject<void>().asObservable()
};

const mockStorage = {};
const mockFirestore = {};

const mockActivities: Activity[] = [
  {
    id: 'act-1',
    travelId: 'travel-1',
    title: 'Visita al Teide',
    description: 'Subida al volcán más alto de España',
    icon: 'bi-mountain',
    activityLevel: 'alto',
    location: 'Teide',
    link: '',
    suggestedDate: '2026-07-01',
    startTime: '09:00',
    duration: '1 día',
    costPerPerson: 50,
    requiresReservation: true,
    notes: '',
    images: [],
    proposedBy: 'user-1',
    proposedByName: 'Silvia',
    votesUp: ['user-2'],
    votesDown: [],
    votingStatus: 'open',
    createdAt: new Date()
  },
  {
    id: 'act-2',
    travelId: 'travel-1',
    title: 'Siam Park',
    description: 'Parque acuático',
    icon: 'bi-water',
    activityLevel: 'medio',
    location: 'Costa Adeje',
    link: '',
    suggestedDate: '2026-07-02',
    startTime: '10:00',
    duration: '4 horas',
    costPerPerson: 35,
    requiresReservation: false,
    notes: '',
    images: [],
    proposedBy: 'user-2',
    proposedByName: 'Paula',
    votesUp: [],
    votesDown: [],
    votingStatus: 'open',
    createdAt: new Date()
  },
  {
    id: 'act-3',
    travelId: 'travel-1',
    title: 'Loro Parque',
    description: 'Zoo temático',
    icon: 'bi-tree',
    activityLevel: 'bajo',
    location: 'Puerto de la Cruz',
    link: '',
    suggestedDate: '2026-07-03',
    startTime: '11:00',
    duration: '5 horas',
    costPerPerson: 40,
    requiresReservation: false,
    notes: '',
    images: [],
    proposedBy: 'user-1',
    proposedByName: 'Silvia',
    votesUp: ['user-1'],
    votesDown: ['user-2'],
    votingStatus: 'closed',
    createdAt: new Date()
  }
];

const mockTravel: Travel = {
  id: 'travel-1',
  icon: 'bi-compass',
  name: 'Viaje a Tenerife',
  description: '',
  startDate: new Date('2026-07-01'),
  endDate: new Date('2026-07-07'),
  itineraryType: 'manual',
  membersCount: 3,
  members: [],
  images: [],
  notes: '',
  createdBy: 'user-1',
  createdAt: new Date()
};

describe('TripDetailComponent', () => {
  let component: TripDetailComponent;
  let fixture: ComponentFixture<TripDetailComponent>;

  beforeEach(async () => {
    searchQuery$.next('');

    await TestBed.configureTestingModule({
      imports: [TripDetailComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: TravelService, useValue: mockTravelService },
        { provide: ActivityService, useValue: mockActivityService },
        { provide: ChatService, useValue: mockChatService },
        { provide: UiService, useValue: mockUiService },
        { provide: Storage, useValue: mockStorage },
        { provide: Firestore, useValue: mockFirestore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TripDetailComponent);
    component = fixture.componentInstance;
    component.activities = mockActivities;
    component.travel = mockTravel;
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // currentUserId
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

  // filteredActivities
  describe('filteredActivities', () => {
    it('debería devolver todas las actividades si searchQuery está vacío', () => {
      component.searchQuery = '';
      expect(component.filteredActivities.length).toBe(3);
    });

    it('debería filtrar por título', () => {
      component.searchQuery = 'teide';
      expect(component.filteredActivities.length).toBe(1);
      expect(component.filteredActivities[0].title).toBe('Visita al Teide');
    });

    it('debería filtrar por descripción', () => {
      component.searchQuery = 'volcán';
      expect(component.filteredActivities.length).toBe(1);
      expect(component.filteredActivities[0].id).toBe('act-1');
    });

    it('debería filtrar por nombre del proponente', () => {
      component.searchQuery = 'paula';
      expect(component.filteredActivities.length).toBe(1);
      expect(component.filteredActivities[0].proposedByName).toBe('Paula');
    });

    it('debería ser insensible a mayúsculas', () => {
      component.searchQuery = 'SIAM';
      expect(component.filteredActivities.length).toBe(1);
    });

    it('debería devolver vacío si no hay coincidencias', () => {
      component.searchQuery = 'xyz123';
      expect(component.filteredActivities.length).toBe(0);
    });

    it('debería devolver todas si searchQuery tiene solo espacios', () => {
      component.searchQuery = '   ';
      expect(component.filteredActivities.length).toBe(3);
    });

    it('debería encontrar múltiples actividades del mismo proponente', () => {
      component.searchQuery = 'silvia';
      expect(component.filteredActivities.length).toBe(2);
    });
  });

  // getVotingLabel
  describe('getVotingLabel', () => {
    it('debería devolver "Votación finalizada" si está cerrada', () => {
      expect(component.getVotingLabel(mockActivities[2])).toBe('Votación finalizada');
    });

    it('debería devolver el label con votos actuales y máximo', () => {
      expect(component.getVotingLabel(mockActivities[0])).toBe('Votación en curso: 1/3 votos');
    });

    it('debería devolver 0 votos si nadie ha votado', () => {
      expect(component.getVotingLabel(mockActivities[1])).toBe('Votación en curso: 0/3 votos');
    });

    it('debería usar membersCount del viaje', () => {
      component.travel = { ...mockTravel, membersCount: 5 };
      expect(component.getVotingLabel(mockActivities[1])).toBe('Votación en curso: 0/5 votos');
    });

    it('debería devolver 0 como máximo si no hay viaje', () => {
      component.travel = null;
      expect(component.getVotingLabel(mockActivities[1])).toBe('Votación en curso: 0/0 votos');
    });
  });

  // isVotingUrgent
  describe('isVotingUrgent', () => {
    it('debería devolver false si la votación está cerrada', () => {
      expect(component.isVotingUrgent(mockActivities[2])).toBeFalse();
    });

    it('debería devolver true si nadie ha votado', () => {
      expect(component.isVotingUrgent(mockActivities[1])).toBeTrue();
    });

    it('debería devolver false si hay votos', () => {
      expect(component.isVotingUrgent(mockActivities[0])).toBeFalse();
    });

    it('debería devolver false si hay votos negativos', () => {
      const activity = { ...mockActivities[1], votesDown: ['user-1'] };
      expect(component.isVotingUrgent(activity)).toBeFalse();
    });
  });
});