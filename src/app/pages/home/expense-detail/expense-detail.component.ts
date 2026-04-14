import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header.component';
import { ExpenseService } from '../../../services/expense.service';
import { TravelService } from '../../../services/travel.service';
import { Expense } from '../../../models/expense';
import { Travel } from '../../../models/travel';
import { Auth } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-expense-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  templateUrl: './expense-detail.component.html',
  styleUrl: './expense-detail.component.css'
})
export class ExpenseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private expenseService = inject(ExpenseService);
  private travelService = inject(TravelService);
  private storage = inject(Storage);
  auth = inject(Auth);

  expense: Expense | null = null;
  travel: Travel | null = null;
  loading = true;
  showFullImage = false;

  // Modal marcar como pagado
  showPayModal = false;
  proofUrl = '';
  uploadingProof = false;
  proofUploaded = false;
  confirmingPayment = false;

  async ngOnInit(): Promise<void> {
    const travelId = this.route.snapshot.paramMap.get('id');
    const expenseId = this.route.snapshot.paramMap.get('expenseId');
    if (!travelId || !expenseId) return;

    this.travel = await this.travelService.getTravelById(travelId);
    const expenses = await this.expenseService.getExpenses(travelId);
    this.expense = expenses.find(e => e.id === expenseId) || null;
    this.loading = false;
  }

  goBack(): void {
    const travelId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/trips', travelId], { fragment: 'gastos' });
  }

  getInitial(email: string): string {
    return email.charAt(0).toUpperCase();
  }

  getInitialColor(email: string): string {
    return 'var(--color-primary, #be681c)';
  }

  get currentUserStatus(): string {
    const currentEmail = this.auth.currentUser?.email || '';
    if (currentEmail === this.expense?.paidByName) return 'Pagó el total';
    if (this.expense?.paidMembers?.includes(currentEmail)) return 'Pagado';
    return 'Pendiente de pago';
  }

  get isPaidByCurrentUser(): boolean {
    return this.expense?.paidByName === this.travel?.members[0]?.email;
  }

  get members(): { email: string; status: string; amount: number }[] {
    if (!this.travel || !this.expense) return [];

    const memberEmails = this.travel.members.map(m => m.email);

    if (this.travel.createdByEmail && !memberEmails.includes(this.travel.createdByEmail)) {
      memberEmails.unshift(this.travel.createdByEmail);
    }

    if (!memberEmails.includes(this.expense.paidByName)) {
      memberEmails.unshift(this.expense.paidByName);
    }

    return memberEmails.map(email => ({
      email,
      status: email === this.expense!.paidByName
        ? 'Pagó el total'
        : (this.expense!.paidMembers?.includes(email) ? 'Pagado' : 'Pendiente'),
      amount: this.expense!.amountPerPerson
    }));
  }

  async downloadReceipt(): Promise<void> {
    if (!this.expense?.receiptUrl) return;
    const a = document.createElement('a');
    a.href = this.expense.receiptUrl;
    a.download = `justificante-${this.expense.name}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  openPayModal(): void {
  this.proofUrl = '';
  this.proofUploaded = false;
  this.showPayModal = true;
}

  async onProofSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadingProof = true;
    try {
      const file = input.files[0];
      const storageRef = ref(this.storage, `proofs/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      this.proofUrl = await getDownloadURL(storageRef);
      this.proofUploaded = true;
    } catch (e: any) {
      console.error('Error subiendo comprobante:', e);
    } finally {
      this.uploadingProof = false;
    }
  }

  async confirmPayment(): Promise<void> {
    if (!this.proofUrl || !this.expense?.id || !this.travel?.id) return;
    this.confirmingPayment = true;
    try {
      const email = this.auth.currentUser?.email || '';
      await this.expenseService.markAsPaid(this.travel.id, this.expense.id, email, this.proofUrl);
      // Recargar el gasto
      const expenses = await this.expenseService.getExpenses(this.travel.id);
      this.expense = expenses.find(e => e.id === this.expense!.id) || null;
      this.showPayModal = false;
    } catch (e: any) {
      console.error('Error confirmando pago:', e);
    } finally {
      this.confirmingPayment = false;
    }
  }
}
