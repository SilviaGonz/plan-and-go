import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-account-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-account-modal.component.html',
  styleUrl: './delete-account-modal.component.css'
})
export class DeleteAccountModalComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
