import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-archived-trip-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './archived-trip-card.component.html',
  styleUrl: './archived-trip-card.component.css'
})
export class ArchivedTripCardComponent {
  @Input() id: string = '';
  @Input() icon: string = '';
  @Input() name: string = '';
  @Input() startDate: Date = new Date();
  @Input() endDate: Date = new Date();
  @Input() members: number = 0;

  @Output() restore = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  get formattedDates(): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const start = this.startDate.toLocaleDateString('es-ES', options);
    const end = this.endDate.toLocaleDateString('es-ES', options);
    return `${start} - ${end}`;
  }
}