import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormTextareaComponent } from '../form-textarea/form-textarea.component';
import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { ExpenseService } from '../../services/expense.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Travel } from '../../models/travel';
import { Auth } from '@angular/fire/auth';
import { ReceiptValidatorService } from '../../services/receipt-validator.service';

@Component({
  selector: 'app-propose-expense-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormInputComponent,
    FormTextareaComponent,
    IconSelectorComponent
  ],
  templateUrl: './propose-expense-modal.component.html',
  styleUrl: './propose-expense-modal.component.css'
})
export class ProposeExpenseModalComponent implements OnInit {
  @Input() travel: Travel | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private storage = inject(Storage);
  private receiptValidator = inject(ReceiptValidatorService);
  auth = inject(Auth);

  selectedIcon = 'bi-house-fill';
  loading = false;
  errorMessage = '';
  receiptUrl = '';
  uploadingReceipt = false;
  validatingReceipt = false;
  receiptValidationError = '';
  today = new Date().toISOString().split('T')[0];

  expenseIcons = [
    'bi-car-front',
    'bi-cup-hot',
    'bi-house',
    'bi-bag',
    'bi-ticket-perforated',
    'bi-music-note-beamed',
    'bi-plus-square'
  ];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    paidBy: ['', Validators.required]
  });

  get nameControl() { return this.form.get('name') as FormControl; }
  get descriptionControl() { return this.form.get('description') as FormControl; }
  get amountControl() { return this.form.get('amount') as FormControl; }
  get dateControl() { return this.form.get('date') as FormControl; }
  get paidByControl() { return this.form.get('paidBy') as FormControl; }

  get amountPerPerson(): number {
    const amount = this.form.get('amount')?.value || 0;
    const members = this.travel?.membersCount || 1;
    return Math.round((amount / members) * 100) / 100;
  }

  get acceptedMembers() {
    const currentEmail = this.auth.currentUser?.email || '';
    const members = this.travel?.members.filter(m => m.status === 'accepted') ?? [];
    const currentInList = members.some(m => m.email === currentEmail);
    if (!currentInList && currentEmail) {
      return [{ email: currentEmail, status: 'accepted' as const }, ...members];
    }
    return members;
  }

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (user?.email) {
      this.form.patchValue({ paidBy: user.email });
    }
  }

  async onReceiptSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadingReceipt = true;
    this.receiptValidationError = '';
    this.receiptUrl = '';
    try {
      const file = input.files[0];
      const storageRef = ref(this.storage, `expenses/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Validar el ticket con Vision API
      this.validatingReceipt = true;
      const result = await this.receiptValidator.validateReceipt(
        url,
        this.amountControl.value || 0,
        'ticket'
      );
      console.log('Resultado validación ticket:', result);

      if (!result.isValid) {
        this.receiptValidationError = result.reason;
      } else {
        this.receiptUrl = url;
      }

    } catch (e: any) {
      this.receiptValidationError = 'Error al procesar la imagen';
    } finally {
      this.uploadingReceipt = false;
      this.validatingReceipt = false;
    }
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.travel?.id) return;

    if (!this.receiptUrl) {
      this.errorMessage = 'Debes adjuntar el ticket o captura del gasto';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    try {
      const { name, description, amount, date, paidBy } = this.form.value;
      await this.expenseService.createExpense(this.travel.id, {
        icon: this.selectedIcon,
        name,
        description,
        amount: Number(amount),
        date: new Date(date + 'T00:00:00'),
        amountPerPerson: this.amountPerPerson,
        receiptUrl: this.receiptUrl,
        paidByName: paidBy
      });
      this.created.emit();
      this.close.emit();
    } catch (e: any) {
      this.errorMessage = e.message;
    } finally {
      this.loading = false;
    }
  }
}
