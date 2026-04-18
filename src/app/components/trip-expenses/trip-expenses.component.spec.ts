import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TripExpensesComponent } from './trip-expenses.component';
import { ExpenseService } from '../../services/expense.service';
import { Router } from '@angular/router';
import { UiService } from '../../services/ui.service';
import { Travel } from '../../models/travel';
import { Expense } from '../../models/expense';
import { BehaviorSubject } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ReceiptValidatorService } from '../../services/receipt-validator.service';

const mockExpenses: Expense[] = [
  {
    id: 'expense-1',
    travelId: 'travel-1',
    icon: 'bi-car-front',
    name: 'Alquiler de coche',
    description: 'Coche para todo el viaje',
    amount: 300,
    date: new Date('2026-07-01'),
    paidBy: 'user-1',
    paidByName: 'silvia@gmail.com',
    amountPerPerson: 100,
    createdAt: new Date()
  },
  {
    id: 'expense-2',
    travelId: 'travel-1',
    icon: 'bi-house',
    name: 'Hotel',
    description: 'Alojamiento 3 noches',
    amount: 450,
    date: new Date('2026-07-02'),
    paidBy: 'user-2',
    paidByName: 'paula@gmail.com',
    amountPerPerson: 150,
    createdAt: new Date()
  },
  {
    id: 'expense-3',
    travelId: 'travel-1',
    icon: 'bi-cup-hot',
    name: 'Restaurante',
    description: 'Cena en La Laguna',
    amount: 90,
    date: new Date('2026-07-03'),
    paidBy: 'user-1',
    paidByName: 'silvia@gmail.com',
    amountPerPerson: 30,
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

const mockExpenseService = {
  getExpenses: jasmine.createSpy('getExpenses').and.returnValue(Promise.resolve(mockExpenses))
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

const searchQuery$ = new BehaviorSubject<string>('');
const mockUiService = {
  searchQuery: searchQuery$.asObservable()
};

const mockAuth = {
  currentUser: { uid: 'user-1', email: 'silvia@gmail.com' }
};

const mockStorage = {};

const mockReceiptValidator = {
  validateReceipt: jasmine.createSpy('validateReceipt').and.returnValue(
    Promise.resolve({ isValid: true, confidence: 100, reason: 'Válido' })
  )
};

describe('TripExpensesComponent', () => {
  let component: TripExpensesComponent;
  let fixture: ComponentFixture<TripExpensesComponent>;

  beforeEach(async () => {
    searchQuery$.next('');
    mockRouter.navigate.calls.reset();
    mockExpenseService.getExpenses.calls.reset();
    mockExpenseService.getExpenses.and.returnValue(Promise.resolve(mockExpenses));

    await TestBed.configureTestingModule({
      imports: [TripExpensesComponent],
      providers: [
        { provide: ExpenseService, useValue: mockExpenseService },
        { provide: Router, useValue: mockRouter },
        { provide: UiService, useValue: mockUiService },
        { provide: Auth, useValue: mockAuth },
        { provide: Storage, useValue: mockStorage },
        { provide: ReceiptValidatorService, useValue: mockReceiptValidator }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TripExpensesComponent);
    component = fixture.componentInstance;
    component.travel = mockTravel;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener showModal false por defecto', () => {
      expect(component.showModal).toBeFalse();
    });

    it('debería tener expandedExpenseId null por defecto', () => {
      expect(component.expandedExpenseId).toBeNull();
    });

    it('debería tener searchQuery vacío por defecto', () => {
      expect(component.searchQuery).toBe('');
    });

    it('debería cargar los gastos al inicializar', async () => {
      await component.ngOnInit();
      expect(component.expenses.length).toBe(3);
    });
  });

  // totalAmount getter
  describe('totalAmount', () => {
    beforeEach(() => {
      component.expenses = mockExpenses;
    });

    it('debería calcular el total correctamente', () => {
      expect(component.totalAmount).toBe(840);
    });

    it('debería devolver 0 si no hay gastos', () => {
      component.expenses = [];
      expect(component.totalAmount).toBe(0);
    });

    it('debería sumar correctamente con un solo gasto', () => {
      component.expenses = [mockExpenses[0]];
      expect(component.totalAmount).toBe(300);
    });
  });

  // totalPerPerson getter
  describe('totalPerPerson', () => {
    beforeEach(() => {
      component.expenses = mockExpenses;
    });

    it('debería calcular el total por persona correctamente', () => {
      expect(component.totalPerPerson).toBe(280);
    });

    it('debería devolver 0 si no hay gastos', () => {
      component.expenses = [];
      expect(component.totalPerPerson).toBe(0);
    });

    it('debería sumar correctamente con un solo gasto', () => {
      component.expenses = [mockExpenses[0]];
      expect(component.totalPerPerson).toBe(100);
    });
  });

  // filteredExpenses getter
  describe('filteredExpenses', () => {
    beforeEach(() => {
      component.expenses = mockExpenses;
    });

    it('debería devolver todos los gastos si searchQuery está vacío', () => {
      component.searchQuery = '';
      expect(component.filteredExpenses.length).toBe(3);
    });

    it('debería filtrar por nombre del gasto', () => {
      component.searchQuery = 'hotel';
      expect(component.filteredExpenses.length).toBe(1);
      expect(component.filteredExpenses[0].name).toBe('Hotel');
    });

    it('debería filtrar por nombre del pagador', () => {
      component.searchQuery = 'paula';
      expect(component.filteredExpenses.length).toBe(1);
      expect(component.filteredExpenses[0].paidByName).toBe('paula@gmail.com');
    });

    it('debería filtrar por descripción', () => {
      component.searchQuery = 'laguna';
      expect(component.filteredExpenses.length).toBe(1);
      expect(component.filteredExpenses[0].name).toBe('Restaurante');
    });

    it('debería ser insensible a mayúsculas', () => {
      component.searchQuery = 'ALQUILER';
      expect(component.filteredExpenses.length).toBe(1);
    });

    it('debería devolver vacío si no hay coincidencias', () => {
      component.searchQuery = 'xyz123';
      expect(component.filteredExpenses.length).toBe(0);
    });

    it('debería devolver todos si searchQuery tiene solo espacios', () => {
      component.searchQuery = '   ';
      expect(component.filteredExpenses.length).toBe(3);
    });

    it('debería encontrar múltiples gastos del mismo pagador', () => {
      component.searchQuery = 'silvia';
      expect(component.filteredExpenses.length).toBe(2);
    });
  });

  // toggleExpand
  describe('toggleExpand', () => {
    it('debería expandir un gasto', () => {
      component.toggleExpand('expense-1');
      expect(component.expandedExpenseId).toBe('expense-1');
    });

    it('debería colapsar un gasto si ya estaba expandido', () => {
      component.toggleExpand('expense-1');
      component.toggleExpand('expense-1');
      expect(component.expandedExpenseId).toBeNull();
    });

    it('debería cambiar el gasto expandido', () => {
      component.toggleExpand('expense-1');
      component.toggleExpand('expense-2');
      expect(component.expandedExpenseId).toBe('expense-2');
    });

    it('debería expandir cualquier id', () => {
      component.toggleExpand('expense-3');
      expect(component.expandedExpenseId).toBe('expense-3');
    });
  });

  // navigateToExpense
  describe('navigateToExpense', () => {
    it('debería navegar a la ruta correcta', () => {
      component.navigateToExpense('expense-1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'travel-1', 'expenses', 'expense-1']);
    });

    it('debería navegar con el id del gasto correcto', () => {
      component.navigateToExpense('expense-2');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/trips', 'travel-1', 'expenses', 'expense-2']);
    });

    it('debería incluir el id del viaje en la ruta', () => {
      component.navigateToExpense('expense-1');
      const args = mockRouter.navigate.calls.mostRecent().args[0];
      expect(args[1]).toBe('travel-1');
    });
  });

  // loadExpenses
  describe('loadExpenses', () => {
    it('debería cargar los gastos del viaje', async () => {
      await component.loadExpenses();
      expect(mockExpenseService.getExpenses).toHaveBeenCalledWith('travel-1');
    });

    it('no debería llamar al servicio si no hay viaje', async () => {
      component.travel = null;
      mockExpenseService.getExpenses.calls.reset();
      await component.loadExpenses();
      expect(mockExpenseService.getExpenses).not.toHaveBeenCalled();
    });

    it('debería actualizar la lista de gastos', async () => {
      await component.loadExpenses();
      expect(component.expenses).toEqual(mockExpenses);
    });
  });

  // onExpenseCreated
  describe('onExpenseCreated', () => {
    it('debería recargar los gastos', async () => {
      mockExpenseService.getExpenses.calls.reset();
      await component.onExpenseCreated();
      expect(mockExpenseService.getExpenses).toHaveBeenCalled();
    });
  });

  // UiService searchQuery
describe('UiService searchQuery', () => {
  it('debería actualizar searchQuery cuando cambia en UiService', async () => {
    await component.ngOnInit();
    searchQuery$.next('hotel');
    expect(component.searchQuery).toBe('hotel');
  });

  it('debería limpiar searchQuery cuando UiService lo limpia', async () => {
    await component.ngOnInit();
    searchQuery$.next('hotel');
    searchQuery$.next('');
    expect(component.searchQuery).toBe('');
  });
});
});
