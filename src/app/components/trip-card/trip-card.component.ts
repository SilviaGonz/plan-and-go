import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-trip-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.css'
})
export class TripCardComponent {
  @Input() id: string = '';
  @Input() icon: string = '';
  @Input() name: string = '';
  @Input() startDate: Date = new Date();
  @Input() endDate: Date = new Date();
  @Input() members: number = 0;

  showMenu = false;

  @Output() edit = new EventEmitter<string>();
  @Output() archive = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  get formattedDates(): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const start = this.startDate.toLocaleDateString('es-ES', options);
    const end = this.endDate.toLocaleDateString('es-ES', options);
    return `${start} - ${end}`;
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  closeMenu() {
    this.showMenu = false;
  }
}
