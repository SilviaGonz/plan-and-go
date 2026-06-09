import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpenseDetailComponent } from './expense-detail.component';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from '../../../services/expense.service';
import { TravelService } from '../../../services/travel.service';
import { ReceiptValidatorService } from '../../../services/receipt-validator.service';
import { Travel } from '../../../models/travel';
import { Expense } from '../../../models/expense';

const mockAuth = {
  currentUser: { uid: 'user-1', email: 'silvia@gmail.com' }
};

const mockRouter = { navigate: jasmine.createSpy('navigate') };
const mockRoute = { snapshot: { paramMap: { get: () => null } } };
const mockStorage = {};
const mockExpenseService = {
  getExpenses: jasmine.createSpy('getExpenses').and.returnValue(Promise.resolve([])),
  markAsPaid: jasmine.createSpy('markAsPaid').and.returnValue(Promise.resolve())
};
const mockTravelService = {
  getTravelById: jasmine.createSpy('getTravelById').and.returnValue(Promise.resolve(null))
};
const mockReceiptValidator = {
  validateReceipt: jasmine.createSpy('validateReceipt').and.returnValue(
    Promise.resolve({ isValid: true, confidence: 100, reason: 'Válido' })
  )
};

const mockTravel: Travel = {
  id: 'travel-1',
  icon: 'bi-compass',
  name: 'Viaje a Tenerife',
  description: '',
  startDate: new Date('2026-07-01'),
  endDate: new Date('2026-07-07'),
  itineraryType: 'manual',
  membersCount: 3,
  members: [
    { email: 'silvia@gmail.com', status: 'accepted' },
    { email: 'paula@gmail.com', status: 'accepted' },
    { email: 'juan@gmail.com', status: 'pending' }
  ],
  images: [],
  notes: '',
  createdBy: 'user-1',
  createdByEmail: 'silvia@gmail.com',
  createdAt: new Date()
};

const mockExpense: Expense = {
  id: 'expense-1',
  travelId: 'travel-1',
  icon: 'bi-car-front',
  name: 'Alquiler coche',
  description: 'Coche para el viaje',
  amount: 300,
  date: new Date('2026-07-01'),
  paidBy: 'user-2',
  paidByName: 'paula@gmail.com',
  amountPerPerson: 100,
  paidMembers: ['juan@gmail.com'],
  createdAt: new Date()
};

describe('ExpenseDetailComponent', () => {
  let component: ExpenseDetailComponent;
  let fixture: ComponentFixture<ExpenseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseDetailComponent],
      providers: [
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: Storage, useValue: mockStorage },
        { provide: ExpenseService, useValue: mockExpenseService },
        { provide: TravelService, useValue: mockTravelService },
        { provide: ReceiptValidatorService, useValue: mockReceiptValidator }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseDetailComponent);
    component = fixture.componentInstance;
    component.travel = mockTravel;
    component.expense = mockExpense;
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // getInitial
  describe('getInitial', () => {
    it('debería devolver la primera letra en mayúscula', () => {
      expect(component.getInitial('silvia@gmail.com')).toBe('S');
    });

    it('debería devolver la primera letra en mayúscula para cualquier email', () => {
      expect(component.getInitial('paula@gmail.com')).toBe('P');
    });

    it('debería manejar emails que empiezan por minúscula', () => {
      expect(component.getInitial('juan@gmail.com')).toBe('J');
    });
  });

  // getInitialColor
  describe('getInitialColor', () => {
    it('debería devolver el color primario', () => {
      expect(component.getInitialColor('silvia@gmail.com')).toBe('var(--color-primary, #be681c)');
    });

    it('debería devolver el mismo color para cualquier email', () => {
      expect(component.getInitialColor('paula@gmail.com')).toBe('var(--color-primary, #be681c)');
    });
  });

  // currentUserStatus
  describe('currentUserStatus', () => {
    it('debería devolver "Pagó el total" si el usuario es quien pagó', () => {
      component.expense = { ...mockExpense, paidByName: 'silvia@gmail.com' };
      expect(component.currentUserStatus).toBe('Pagó el total');
    });

    it('debería devolver "Pagado" si el usuario está en paidMembers', () => {
      component.expense = { ...mockExpense, paidByName: 'paula@gmail.com', paidMembers: ['silvia@gmail.com'] };
      expect(component.currentUserStatus).toBe('Pagado');
    });

    it('debería devolver "Pendiente de pago" si el usuario no ha pagado', () => {
      component.expense = { ...mockExpense, paidByName: 'paula@gmail.com', paidMembers: [] };
      expect(component.currentUserStatus).toBe('Pendiente de pago');
    });

    it('debería devolver "Pendiente de pago" si no hay expense', () => {
      component.expense = null;
      expect(component.currentUserStatus).toBe('Pendiente de pago');
    });

    it('debería devolver "Pendiente de pago" si paidMembers no incluye al usuario', () => {
      component.expense = { ...mockExpense, paidByName: 'paula@gmail.com', paidMembers: ['juan@gmail.com'] };
      expect(component.currentUserStatus).toBe('Pendiente de pago');
    });
  });

  // members getter
  describe('members', () => {
    it('debería devolver lista vacía si no hay travel', () => {
      component.travel = null;
      expect(component.members).toEqual([]);
    });

    it('debería devolver lista vacía si no hay expense', () => {
      component.expense = null;
      expect(component.members).toEqual([]);
    });

    it('debería incluir todos los miembros del viaje', () => {
      const members = component.members;
      expect(members.some(m => m.email === 'silvia@gmail.com')).toBeTrue();
      expect(members.some(m => m.email === 'paula@gmail.com')).toBeTrue();
      expect(members.some(m => m.email === 'juan@gmail.com')).toBeTrue();
    });

    it('debería marcar el pagador como "Pagó el total"', () => {
      const members = component.members;
      const payer = members.find(m => m.email === 'paula@gmail.com');
      expect(payer?.status).toBe('Pagó el total');
    });

    it('debería marcar miembros de paidMembers como "Pagado"', () => {
      const members = component.members;
      const paid = members.find(m => m.email === 'juan@gmail.com');
      expect(paid?.status).toBe('Pagado');
    });

    it('debería marcar miembros sin pagar como "Pendiente"', () => {
      component.expense = { ...mockExpense, paidMembers: [] };
      const members = component.members;
      const pending = members.find(m => m.email === 'silvia@gmail.com');
      expect(pending?.status).toBe('Pendiente');
    });

    it('debería asignar el amountPerPerson a cada miembro', () => {
      const members = component.members;
      members.forEach(m => expect(m.amount).toBe(100));
    });

    it('no debería duplicar el pagador si ya está en la lista de miembros', () => {
      const members = component.members;
      const count = members.filter(m => m.email === 'paula@gmail.com').length;
      expect(count).toBe(1);
    });

    it('debería añadir el creador si no está en la lista de miembros', () => {
      component.travel = {
        ...mockTravel,
        createdByEmail: 'admin@gmail.com',
        members: [{ email: 'paula@gmail.com', status: 'accepted' }]
      };
      const members = component.members;
      expect(members.some(m => m.email === 'admin@gmail.com')).toBeTrue();
    });
  });

  // openPayModal
  describe('openPayModal', () => {
    it('debería mostrar el modal', () => {
      component.openPayModal();
      expect(component.showPayModal).toBeTrue();
    });

    it('debería limpiar proofUrl', () => {
      component.proofUrl = 'https://proof.jpg';
      component.openPayModal();
      expect(component.proofUrl).toBe('');
    });

    it('debería resetear proofUploaded', () => {
      component.proofUploaded = true;
      component.openPayModal();
      expect(component.proofUploaded).toBeFalse();
    });

    it('debería limpiar validationError', () => {
      component.validationError = 'Error previo';
      component.openPayModal();
      expect(component.validationError).toBe('');
    });

    it('debería resetear todos los valores a la vez', () => {
      component.proofUrl = 'https://proof.jpg';
      component.proofUploaded = true;
      component.validationError = 'Error';
      component.openPayModal();
      expect(component.proofUrl).toBe('');
      expect(component.proofUploaded).toBeFalse();
      expect(component.validationError).toBe('');
      expect(component.showPayModal).toBeTrue();
    });
  });
});