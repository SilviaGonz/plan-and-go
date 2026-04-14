export interface Expense {
  id?: string;
  travelId: string;
  icon: string;
  name: string;
  description: string;
  amount: number;
  date: Date;
  paidBy: string;
  paidByName: string;
  amountPerPerson: number;
  receiptUrl?: string;
  createdAt: Date;
  paidMembers?: string[];
}
