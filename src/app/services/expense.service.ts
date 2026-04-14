import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, getDocs, serverTimestamp, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Expense } from '../models/expense';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async createExpense(
    travelId: string,
    expense: Omit<Expense, 'id' | 'createdAt' | 'paidBy' | 'paidByName' | 'travelId'> & { paidByName: string }
  ): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('No autenticado');

    const ref = collection(this.firestore, `travels/${travelId}/expenses`);
    await addDoc(ref, {
      ...expense,
      travelId,
      paidBy: user.uid,
      date: expense.date,
      createdAt: serverTimestamp()
    });
  }

  async getExpenses(travelId: string): Promise<Expense[]> {
    const ref = collection(this.firestore, `travels/${travelId}/expenses`);
    const q = query(ref, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data()['date']?.toDate(),
      createdAt: doc.data()['createdAt']?.toDate()
    })) as Expense[];
  }

  async markAsPaid(travelId: string, expenseId: string, email: string, proofUrl: string): Promise<void> {
  const docRef = doc(this.firestore, `travels/${travelId}/expenses`, expenseId);
  const snapshot = await getDoc(docRef);
  const data = snapshot.data();
  const paidMembers = data?.['paidMembers'] || [];
  if (!paidMembers.includes(email)) paidMembers.push(email);
  await updateDoc(docRef, { paidMembers, proofUrls: { ...data?.['proofUrls'], [email]: proofUrl } });
}
}
