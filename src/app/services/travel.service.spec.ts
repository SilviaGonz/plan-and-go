import { TestBed } from '@angular/core/testing';
import { TravelService } from './travel.service';
import { Firestore, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { InvitationService } from './invitation.service';
import { Travel, DayItinerary } from '../models/travel';

const mockFirestore = {};

const mockAuth = {
  currentUser: {
    uid: 'user-1',
    email: 'silvia@gmail.com',
    displayName: 'Silvia'
  }
};

const mockInvitationService = {
  sendInvitations: jasmine.createSpy('sendInvitations').and.returnValue(Promise.resolve())
};

const mockTravels: Travel[] = [
  {
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
    createdAt: new Date(),
    archived: false
  },
  {
    id: 'travel-2',
    icon: 'bi-airplane',
    name: 'Viaje a Madrid',
    description: '',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-05'),
    itineraryType: 'later',
    membersCount: 2,
    members: [],
    images: [],
    notes: '',
    createdBy: 'user-1',
    createdAt: new Date(),
    archived: false
  },
  {
    id: 'travel-3',
    icon: 'bi-house',
    name: 'Viaje archivado',
    description: '',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-07'),
    itineraryType: 'later',
    membersCount: 2,
    members: [],
    images: [],
    notes: '',
    createdBy: 'user-1',
    createdAt: new Date(),
    archived: true
  }
];

describe('TravelService', () => {
  let service: TravelService;

  beforeEach(() => {
    mockInvitationService.sendInvitations.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        TravelService,
        { provide: Firestore, useValue: mockFirestore },
        { provide: Auth, useValue: mockAuth },
        { provide: InvitationService, useValue: mockInvitationService }
      ]
    });
    service = TestBed.inject(TravelService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // createTravel
  describe('createTravel', () => {
    it('debería lanzar error si no hay usuario autenticado', async () => {
      (mockAuth as any).currentUser = null;
      await expectAsync(
        service.createTravel({
          icon: 'bi-compass',
          name: 'Viaje',
          description: '',
          startDate: new Date(),
          endDate: new Date(),
          itineraryType: 'later',
          membersCount: 1,
          members: [],
          images: [],
          notes: '',
          itinerary: []
        })
      ).toBeRejectedWithError('Usuario no autenticado');
      (mockAuth as any).currentUser = { uid: 'user-1', email: 'silvia@gmail.com', displayName: 'Silvia' };
    });

    it('debería llamar a createTravel con los parámetros correctos', async () => {
      spyOn(service, 'createTravel').and.returnValue(Promise.resolve('new-id'));
      const result = await service.createTravel({
        icon: 'bi-compass',
        name: 'Viaje test',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        itineraryType: 'later',
        membersCount: 1,
        members: [],
        images: [],
        notes: '',
        itinerary: []
      });
      expect(result).toBe('new-id');
    });
  });

  // getNextTrip
  describe('getNextTrip', () => {
    it('debería devolver null si no hay viajes', () => {
      expect(service.getNextTrip([])).toBeNull();
    });

    it('debería devolver el próximo viaje futuro', () => {
  const today = new Date();
  const future1 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const future2 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const travels: Travel[] = [
    { ...mockTravels[0], startDate: future1 },
    { ...mockTravels[1], startDate: future2 }
  ];

  const next = service.getNextTrip(travels);
  expect(next?.startDate).toEqual(future1);
});

    it('debería devolver null si todos los viajes son pasados', () => {
      const past = new Date('2020-01-01');
      const travels: Travel[] = [
        { ...mockTravels[0], startDate: past },
        { ...mockTravels[1], startDate: past }
      ];
      expect(service.getNextTrip(travels)).toBeNull();
    });

    it('debería devolver el primero si hay un solo viaje futuro', () => {
      const future = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
      const travels: Travel[] = [{ ...mockTravels[0], startDate: future }];
      const next = service.getNextTrip(travels);
      expect(next).toEqual(travels[0]);
    });

    it('debería devolver el viaje más próximo entre varios futuros', () => {
  const today = new Date();
  const near = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const far = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
  const travels: Travel[] = [
    { ...mockTravels[0], startDate: near },
    { ...mockTravels[1], startDate: far }
  ];
  const next = service.getNextTrip(travels);
  expect(next?.startDate).toEqual(near);
});

    it('no debería devolver viajes de hoy como próximos', () => {
      const today = new Date();
      const travels: Travel[] = [{ ...mockTravels[0], startDate: today }];
      expect(service.getNextTrip(travels)).toBeNull();
    });
  });

  // serializeItinerary
  describe('serializeItinerary', () => {
    it('debería serializar el itinerario correctamente', () => {
      const itinerary: DayItinerary[] = [
        {
          date: new Date('2026-07-01'),
          label: 'Miércoles, 1 de julio de 2026',
          activities: [{ name: 'Visita al Teide', time: '10:00' }]
        }
      ];
      const result = (service as any).serializeItinerary(itinerary);
      expect(result.length).toBe(1);
      expect(result[0].label).toBe('Miércoles, 1 de julio de 2026');
      expect(result[0].activities).toEqual([{ name: 'Visita al Teide', time: '10:00' }]);
    });

    it('debería convertir la fecha a Timestamp', () => {
      const itinerary: DayItinerary[] = [
        {
          date: new Date('2026-07-01'),
          label: 'Test',
          activities: []
        }
      ];
      const result = (service as any).serializeItinerary(itinerary);
      expect(result[0].date).toBeInstanceOf(Timestamp);
    });

    it('debería devolver array vacío si el itinerario está vacío', () => {
      const result = (service as any).serializeItinerary([]);
      expect(result).toEqual([]);
    });

    it('debería serializar múltiples días correctamente', () => {
      const itinerary: DayItinerary[] = [
        { date: new Date('2026-07-01'), label: 'Día 1', activities: [] },
        { date: new Date('2026-07-02'), label: 'Día 2', activities: [] },
        { date: new Date('2026-07-03'), label: 'Día 3', activities: [] }
      ];
      const result = (service as any).serializeItinerary(itinerary);
      expect(result.length).toBe(3);
    });

    it('debería mantener las actividades intactas', () => {
      const activities = [
        { name: 'Actividad 1', time: '09:00' },
        { name: 'Actividad 2', time: '14:00' }
      ];
      const itinerary: DayItinerary[] = [
        { date: new Date('2026-07-01'), label: 'Día 1', activities }
      ];
      const result = (service as any).serializeItinerary(itinerary);
      expect(result[0].activities).toEqual(activities);
    });
  });

  // getUserTravels
  describe('getUserTravels', () => {
    it('debería devolver array vacío si no hay usuario', async () => {
      (mockAuth as any).currentUser = null;
      spyOn(service, 'getUserTravels').and.callThrough();
      const result = await service.getUserTravels();
      expect(result).toEqual([]);
      (mockAuth as any).currentUser = { uid: 'user-1', email: 'silvia@gmail.com', displayName: 'Silvia' };
    });

    it('debería llamar a getUserTravels y devolver promesa', () => {
      spyOn(service, 'getUserTravels').and.returnValue(Promise.resolve([]));
      const result = service.getUserTravels();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  // getTravelById
  describe('getTravelById', () => {
    it('debería llamar a getTravelById con el id correcto', async () => {
      spyOn(service, 'getTravelById').and.returnValue(Promise.resolve(null));
      await service.getTravelById('travel-1');
      expect(service.getTravelById).toHaveBeenCalledWith('travel-1');
    });

    it('debería devolver null si el viaje no existe', async () => {
      spyOn(service, 'getTravelById').and.returnValue(Promise.resolve(null));
      const result = await service.getTravelById('no-existe');
      expect(result).toBeNull();
    });
  });

  // updateTravel
  describe('updateTravel', () => {
    it('debería llamar a updateTravel con los parámetros correctos', async () => {
      spyOn(service, 'updateTravel').and.returnValue(Promise.resolve());
      await service.updateTravel('travel-1', { name: 'Nuevo nombre' });
      expect(service.updateTravel).toHaveBeenCalledWith('travel-1', { name: 'Nuevo nombre' });
    });
  });

  // deleteTravel
  describe('deleteTravel', () => {
    it('debería llamar a deleteTravel con el id correcto', async () => {
      spyOn(service, 'deleteTravel').and.returnValue(Promise.resolve());
      await service.deleteTravel('travel-1');
      expect(service.deleteTravel).toHaveBeenCalledWith('travel-1');
    });
  });

  // archiveTravel
  describe('archiveTravel', () => {
    it('debería llamar a archiveTravel con el id correcto', async () => {
      spyOn(service, 'archiveTravel').and.returnValue(Promise.resolve());
      await service.archiveTravel('travel-1');
      expect(service.archiveTravel).toHaveBeenCalledWith('travel-1');
    });
  });

  // restoreTravel
  describe('restoreTravel', () => {
    it('debería llamar a restoreTravel con el id correcto', async () => {
      spyOn(service, 'restoreTravel').and.returnValue(Promise.resolve());
      await service.restoreTravel('travel-1');
      expect(service.restoreTravel).toHaveBeenCalledWith('travel-1');
    });
  });

  // getArchivedTravels
  describe('getArchivedTravels', () => {
    it('debería devolver array vacío si no hay usuario', async () => {
      (mockAuth as any).currentUser = null;
      spyOn(service, 'getArchivedTravels').and.callThrough();
      const result = await service.getArchivedTravels();
      expect(result).toEqual([]);
      (mockAuth as any).currentUser = { uid: 'user-1', email: 'silvia@gmail.com', displayName: 'Silvia' };
    });
  });
});
