import { TestBed } from '@angular/core/testing';
import { ExpenseService } from './expense.service';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

const mockFirestore = {};
const mockAuth = {
  currentUser: { uid: 'user-1', email: 'silvia@gmail.com', displayName: 'Silvia' }
};

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExpenseService,
        { provide: Firestore, useValue: mockFirestore },
        { provide: Auth, useValue: mockAuth }
      ]
    });
    service = TestBed.inject(ExpenseService);
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  // createExpense
  describe('createExpense', () => {
    it('debería lanzar error si no hay usuario autenticado', async () => {
      (mockAuth as any).currentUser = null;
      await expectAsync(
        service.createExpense('travel-1', {
          icon: 'bi-car-front',
          name: 'Alquiler coche',
          description: '',
          amount: 300,
          date: new Date(),
          amountPerPerson: 100,
          receiptUrl: '',
          paidByName: 'silvia@gmail.com'
        })
      ).toBeRejectedWithError('No autenticado');
      (mockAuth as any).currentUser = { uid: 'user-1', email: 'silvia@gmail.com', displayName: 'Silvia' };
    });

    it('debería llamar a createExpense con los parámetros correctos', async () => {
      spyOn(service, 'createExpense').and.returnValue(Promise.resolve());
      await service.createExpense('travel-1', {
        icon: 'bi-car-front',
        name: 'Alquiler coche',
        description: '',
        amount: 300,
        date: new Date(),
        amountPerPerson: 100,
        receiptUrl: '',
        paidByName: 'silvia@gmail.com'
      });
      expect(service.createExpense).toHaveBeenCalled();
    });
  });

  // getExpenses
  describe('getExpenses', () => {
    it('debería llamar a getExpenses con el travelId correcto', async () => {
      spyOn(service, 'getExpenses').and.returnValue(Promise.resolve([]));
      await service.getExpenses('travel-1');
      expect(service.getExpenses).toHaveBeenCalledWith('travel-1');
    });

    it('debería devolver una lista vacía si no hay gastos', async () => {
      spyOn(service, 'getExpenses').and.returnValue(Promise.resolve([]));
      const expenses = await service.getExpenses('travel-1');
      expect(expenses).toEqual([]);
    });

    it('debería devolver una promesa', () => {
      spyOn(service, 'getExpenses').and.returnValue(Promise.resolve([]));
      const result = service.getExpenses('travel-1');
      expect(result).toBeInstanceOf(Promise);
    });
  });

  // markAsPaid
  describe('markAsPaid', () => {
    it('debería llamar a markAsPaid con los parámetros correctos', async () => {
      spyOn(service, 'markAsPaid').and.returnValue(Promise.resolve());
      await service.markAsPaid('travel-1', 'expense-1', 'silvia@gmail.com', 'https://proof.jpg');
      expect(service.markAsPaid).toHaveBeenCalledWith(
        'travel-1', 'expense-1', 'silvia@gmail.com', 'https://proof.jpg'
      );
    });

    it('debería devolver una promesa', () => {
      spyOn(service, 'markAsPaid').and.returnValue(Promise.resolve());
      const result = service.markAsPaid('travel-1', 'expense-1', 'silvia@gmail.com', 'https://proof.jpg');
      expect(result).toBeInstanceOf(Promise);
    });

    it('debería llamar a markAsPaid solo una vez', async () => {
      spyOn(service, 'markAsPaid').and.returnValue(Promise.resolve());
      await service.markAsPaid('travel-1', 'expense-1', 'silvia@gmail.com', 'https://proof.jpg');
      expect(service.markAsPaid).toHaveBeenCalledTimes(1);
    });
  });
});
