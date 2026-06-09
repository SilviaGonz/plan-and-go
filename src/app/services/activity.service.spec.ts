import { TestBed } from '@angular/core/testing';
import { ActivityService } from './activity.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Activity } from '../models/activity';

const mockActivities: Activity[] = [
  {
    id: 'act-1',
    travelId: 'travel-1',
    title: 'Visita al Teide',
    description: 'Subida al volcán',
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
    description: 'Zoo y parque temático',
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

const mockFirestore = {};
const mockAuth = {
  currentUser: { uid: 'user-1', email: 'silvia@gmail.com' }
};

describe('ActivityService', () => {
  let service: ActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ActivityService,
        { provide: Firestore, useValue: mockFirestore },
        { provide: Auth, useValue: mockAuth }
      ]
    });
    service = TestBed.inject(ActivityService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // getPendingVotesCount
  describe('getPendingVotesCount', () => {
    beforeEach(() => {
      spyOn(service, 'getActivities').and.returnValue(Promise.resolve(mockActivities));
    });

    it('debería devolver 0 si no hay travelIds', async () => {
      const count = await service.getPendingVotesCount('user-1', []);
      expect(count).toBe(0);
    });

    it('debería contar actividades abiertas sin votar', async () => {
      const count = await service.getPendingVotesCount('user-1', ['travel-1']);
      // act-1: open pero user-1 no ha votado ✅
      // act-2: open y nadie ha votado ✅
      // act-3: closed ❌
      expect(count).toBe(2);
    });

    it('debería devolver 0 si el usuario ya votó todas las actividades abiertas', async () => {
      const activitiesAllVoted: Activity[] = [
        { ...mockActivities[0], votesUp: ['user-1'] },
        { ...mockActivities[1], votesUp: ['user-1'] }
      ];
      (service.getActivities as jasmine.Spy).and.returnValue(Promise.resolve(activitiesAllVoted));
      const count = await service.getPendingVotesCount('user-1', ['travel-1']);
      expect(count).toBe(0);
    });

    it('debería devolver 0 si todas las actividades están cerradas', async () => {
      const closedActivities: Activity[] = [
        { ...mockActivities[0], votingStatus: 'closed' },
        { ...mockActivities[1], votingStatus: 'closed' }
      ];
      (service.getActivities as jasmine.Spy).and.returnValue(Promise.resolve(closedActivities));
      const count = await service.getPendingVotesCount('user-1', ['travel-1']);
      expect(count).toBe(0);
    });

    it('debería contar actividades de múltiples viajes', async () => {
      (service.getActivities as jasmine.Spy).and.returnValue(Promise.resolve([mockActivities[1]]));
      const count = await service.getPendingVotesCount('user-1', ['travel-1', 'travel-2']);
      expect(count).toBe(2);
    });

    it('no debería contar actividades donde el usuario votó a favor', async () => {
      const activities: Activity[] = [
        { ...mockActivities[0], votesUp: ['user-1'], votesDown: [] }
      ];
      (service.getActivities as jasmine.Spy).and.returnValue(Promise.resolve(activities));
      const count = await service.getPendingVotesCount('user-1', ['travel-1']);
      expect(count).toBe(0);
    });

    it('no debería contar actividades donde el usuario votó en contra', async () => {
      const activities: Activity[] = [
        { ...mockActivities[0], votesUp: [], votesDown: ['user-1'] }
      ];
      (service.getActivities as jasmine.Spy).and.returnValue(Promise.resolve(activities));
      const count = await service.getPendingVotesCount('user-1', ['travel-1']);
      expect(count).toBe(0);
    });

    it('debería devolver 0 si no hay actividades', async () => {
      (service.getActivities as jasmine.Spy).and.returnValue(Promise.resolve([]));
      const count = await service.getPendingVotesCount('user-1', ['travel-1']);
      expect(count).toBe(0);
    });

    it('debería contar correctamente con diferentes usuarios', async () => {
      const count = await service.getPendingVotesCount('user-2', ['travel-1']);
      // act-1: open, user-2 ya votó votesUp ❌
      // act-2: open, user-2 no ha votado ✅
      // act-3: closed ❌
      expect(count).toBe(1);
    });
  });
});
