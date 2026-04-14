import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Travel } from '../../models/travel';
import { Expense } from '../../models/expense';
import { ExpenseService } from '../../services/expense.service';
import { ProposeExpenseModalComponent } from '../propose-expense-modal/propose-expense-modal.component';
import { Router } from '@angular/router';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-trip-expenses',
  standalone: true,
  imports: [CommonModule, ProposeExpenseModalComponent],
  templateUrl: './trip-expenses.component.html',
  styleUrl: './trip-expenses.component.css'
})
export class TripExpensesComponent implements OnInit, OnDestroy {
  @Input() travel: Travel | null = null;

  private expenseService = inject(ExpenseService);
  private router = inject(Router);
  private uiService = inject(UiService);
  private subscription = new Subscription();

  expenses: Expense[] = [];
  showModal = false;
  expandedExpenseId: string | null = null;
  searchQuery = '';

  get totalAmount(): number {
    return this.expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  get totalPerPerson(): number {
    return this.expenses.reduce((sum, e) => sum + e.amountPerPerson, 0);
  }

  get filteredExpenses(): Expense[] {
    if (!this.searchQuery.trim()) return this.expenses;
    const q = this.searchQuery.toLowerCase();
    return this.expenses.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.paidByName.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q)
    );
  }

  navigateToExpense(expenseId: string): void {
    this.router.navigate(['/trips', this.travel?.id, 'expenses', expenseId]);
  }

  async ngOnInit(): Promise<void> {
    await this.loadExpenses();

    this.subscription.add(
      this.uiService.searchQuery.subscribe(query => {
        this.searchQuery = query;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async loadExpenses(): Promise<void> {
    if (!this.travel?.id) return;
    this.expenses = await this.expenseService.getExpenses(this.travel.id);
  }

  async onExpenseCreated(): Promise<void> {
    await this.loadExpenses();
  }

  toggleExpand(id: string): void {
    this.expandedExpenseId = this.expandedExpenseId === id ? null : id;
  }
}
