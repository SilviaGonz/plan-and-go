import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Travel } from '../../models/travel';

@Component({
  selector: 'app-delete-travel-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-travel-modal.component.html',
  styleUrl: './delete-travel-modal.component.css'
})
export class DeleteTravelModalComponent {
  @Input() travel!: Travel;
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  get formattedDates(): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const start = this.travel.startDate.toLocaleDateString('es-ES', options);
    const end = this.travel.endDate.toLocaleDateString('es-ES', options);
    return `${start} - ${end}`;
  }
}
