import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProposeExpenseModalComponent } from './propose-expense-modal.component';
import { ExpenseService } from '../../services/expense.service';
import { Auth } from '@angular/fire/auth';
import { Storage } from '@angular/fire/storage';
import { ReceiptValidatorService } from '../../services/receipt-validator.service';
import { Travel } from '../../models/travel';

const mockExpenseService = {
  createExpense: jasmine.createSpy('createExpense').and.returnValue(Promise.resolve())
};

const mockAuth = {
  currentUser: { uid: 'user-1', displayName: 'Test User', email: 'silvia@gmail.com' }
};

const mockStorage = {};

const mockReceiptValidator = {
  validateReceipt: jasmine.createSpy('validateReceipt').and.returnValue(
    Promise.resolve({ isValid: true, confidence: 100, reason: 'Válido' })
  )
};

const mockTravel: Travel = {
  id: 'travel-1',
  icon: 'bi-compass',
  name: 'Viaje a Tenerife',
  description: 'Un viaje de prueba',
  startDate: new Date('2026-07-01'),
  endDate: new Date('2026-07-07'),
  itineraryType: 'manual',
  membersCount: 3,
  members: [
    { email: 'prueba1@gmail.com', status: 'accepted' },
    { email: 'prueba2@gmail.com', status: 'accepted' },
    { email: 'prueba3@gmail.com', status: 'pending' }
  ],
  images: [],
  notes: '',
  createdBy: 'user-1',
  createdAt: new Date(),
};

describe('ProposeExpenseModalComponent', () => {
  let component: ProposeExpenseModalComponent;
  let fixture: ComponentFixture<ProposeExpenseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposeExpenseModalComponent],
      providers: [
        { provide: ExpenseService, useValue: mockExpenseService },
        { provide: Auth, useValue: mockAuth },
        { provide: Storage, useValue: mockStorage },
        { provide: ReceiptValidatorService, useValue: mockReceiptValidator }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProposeExpenseModalComponent);
    component = fixture.componentInstance;
    component.travel = mockTravel;
    fixture.detectChanges();
  });

  // Creación
  describe('Creación', () => {
    it('debería crearse correctamente', () => {
      expect(component).toBeTruthy();
    });

    it('debería tener valores por defecto correctos', () => {
      expect(component.selectedIcon).toBe('bi-house-fill');
      expect(component.loading).toBeFalse();
      expect(component.errorMessage).toBe('');
      expect(component.receiptUrl).toBe('');
      expect(component.uploadingReceipt).toBeFalse();
      expect(component.validatingReceipt).toBeFalse();
      expect(component.receiptValidationError).toBe('');
    });

    it('debería tener 7 iconos de gasto', () => {
      expect(component.expenseIcons.length).toBe(7);
    });

    it('debería inicializar paidBy con el email del usuario actual', () => {
      expect(component.form.get('paidBy')?.value).toBe('silvia@gmail.com');
    });
  });

  // Formulario
  describe('Formulario', () => {
    it('debería ser inválido con amount 0', () => {
      component.form.patchValue({ name: 'Gasto', amount: 0, paidBy: 'silvia@gmail.com' });
      expect(component.form.invalid).toBeTrue();
    });

    it('debería ser válido con todos los campos correctos', () => {
      component.form.patchValue({
        name: 'Alquiler coche',
        amount: 100,
        date: '2026-07-01',
        paidBy: 'silvia@gmail.com'
      });
      expect(component.form.valid).toBeTrue();
    });

    it('debería ser inválido sin nombre', () => {
      component.form.patchValue({ name: '', amount: 100, paidBy: 'silvia@gmail.com' });
      expect(component.form.invalid).toBeTrue();
    });

    it('debería ser inválido sin paidBy', () => {
      component.form.patchValue({ name: 'Gasto', amount: 100, paidBy: '' });
      expect(component.form.invalid).toBeTrue();
    });

    it('debería ser inválido con amount negativo', () => {
      component.form.patchValue({ name: 'Gasto', amount: -10, paidBy: 'silvia@gmail.com' });
      expect(component.form.invalid).toBeTrue();
    });
  });

  // amountPerPerson getter
  describe('amountPerPerson', () => {
    it('debería calcular correctamente el importe por persona', () => {
      component.form.patchValue({ amount: 300 });
      expect(component.amountPerPerson).toBe(100);
    });

    it('debería devolver 0 si el importe es 0', () => {
      component.form.patchValue({ amount: 0 });
      expect(component.amountPerPerson).toBe(0);
    });

    it('debería redondear a 2 decimales', () => {
      component.form.patchValue({ amount: 100 });
      expect(component.amountPerPerson).toBe(33.33);
    });

    it('debería devolver el total si solo hay 1 miembro', () => {
      component.travel = { ...mockTravel, membersCount: 1 };
      component.form.patchValue({ amount: 50 });
      expect(component.amountPerPerson).toBe(50);
    });

    it('debería usar membersCount del viaje', () => {
      component.travel = { ...mockTravel, membersCount: 5 };
      component.form.patchValue({ amount: 100 });
      expect(component.amountPerPerson).toBe(20);
    });

    it('debería devolver el importe completo si travel es null', () => {
      component.travel = null;
      component.form.patchValue({ amount: 100 });
      expect(component.amountPerPerson).toBe(100);
    });
  });

  // acceptedMembers getter
  describe('acceptedMembers', () => {
    it('debería incluir solo miembros con status accepted', () => {
      const accepted = component.acceptedMembers;
      const allAccepted = accepted.every(m => m.status === 'accepted');
      expect(allAccepted).toBeTrue();
    });

    it('debería añadir el usuario actual si no está en la lista', () => {
      const accepted = component.acceptedMembers;
      const currentUserInList = accepted.some(m => m.email === 'silvia@gmail.com');
      expect(currentUserInList).toBeTrue();
    });

    it('no debería duplicar el usuario actual si ya está en la lista', () => {
      component.travel = {
        ...mockTravel,
        members: [{ email: 'silvia@gmail.com', status: 'accepted' }]
      };
      const accepted = component.acceptedMembers;
      const count = accepted.filter(m => m.email === 'silvia@gmail.com').length;
      expect(count).toBe(1);
    });

    it('debería filtrar miembros con status pending', () => {
      const accepted = component.acceptedMembers;
      const hasPending = accepted.some(m => m.status === 'pending');
      expect(hasPending).toBeFalse();
    });

    it('debería devolver lista vacía con solo el usuario actual si no hay miembros', () => {
      component.travel = { ...mockTravel, members: [] };
      const accepted = component.acceptedMembers;
      expect(accepted.length).toBe(1);
      expect(accepted[0].email).toBe('silvia@gmail.com');
    });
  });

  // Getters FormControl
  describe('Getters de FormControl', () => {
    it('debería devolver nameControl', () => {
      expect(component.nameControl).toBeTruthy();
    });

    it('debería devolver descriptionControl', () => {
      expect(component.descriptionControl).toBeTruthy();
    });

    it('debería devolver amountControl', () => {
      expect(component.amountControl).toBeTruthy();
    });

    it('debería devolver dateControl', () => {
      expect(component.dateControl).toBeTruthy();
    });

    it('debería devolver paidByControl', () => {
      expect(component.paidByControl).toBeTruthy();
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
      component.form.patchValue({ name: '', amount: 0 });
      await component.onSubmit();
      expect(component.created.emit).not.toHaveBeenCalled();
    });

    it('debería marcar campos como touched si el formulario es inválido', async () => {
      await component.onSubmit();
      expect(component.form.touched).toBeTrue();
    });

    it('no debería enviar si no hay receiptUrl aunque el formulario sea válido', async () => {
      spyOn(component.created, 'emit');
      component.form.patchValue({
        name: 'Gasto',
        amount: 100,
        date: '2026-07-01',
        paidBy: 'silvia@gmail.com'
      });
      component.receiptUrl = '';
      await component.onSubmit();
      expect(component.errorMessage).toBe('Debes adjuntar el ticket o captura del gasto');
      expect(component.created.emit).not.toHaveBeenCalled();
    });

    it('debería llamar a createExpense si el formulario es válido y hay receiptUrl', async () => {
      component.form.patchValue({
        name: 'Gasto',
        amount: 100,
        date: '2026-07-01',
        paidBy: 'silvia@gmail.com'
      });
      component.receiptUrl = 'https://storage.firebase.com/receipt.jpg';
      await component.onSubmit();
      expect(mockExpenseService.createExpense).toHaveBeenCalled();
    });
  });
});
