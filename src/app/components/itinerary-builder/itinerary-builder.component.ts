import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DayItinerary, ActivityItem } from '../../models/travel';

@Component({
  selector: 'app-itinerary-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './itinerary-builder.component.html',
  styleUrl: './itinerary-builder.component.css'
})
export class ItineraryBuilderComponent implements OnChanges {
  @Input() startDate: string = '';
  @Input() endDate: string = '';
  @Input() initialItinerary: DayItinerary[] = [];
  @Output() itineraryChange = new EventEmitter<DayItinerary[]>();

  days: DayItinerary[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['startDate'] || changes['endDate']) {
      this.buildDays();
    }
  }

  private buildDays(): void {
  if (!this.startDate || !this.endDate) return;

  const start = new Date(this.startDate + 'T00:00:00');
  const end = new Date(this.endDate + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return;

  const newDays: DayItinerary[] = [];
  const current = new Date(start);

  while (current <= end) {
    const label = current.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const capitalLabel = label.charAt(0).toUpperCase() + label.slice(1);

    // Busca primero en initialItinerary, luego en days existentes
    const fromInitial = this.initialItinerary.find(d =>
      new Date(d.date).toDateString() === current.toDateString()
    );
    const fromExisting = this.days.find(d =>
      d.date.toDateString() === current.toDateString()
    );

    newDays.push({
      date: new Date(current),
      label: capitalLabel,
      activities: fromInitial?.activities ?? fromExisting?.activities ?? [{ name: '', time: '00:00' }]
    });

    current.setDate(current.getDate() + 1);
  }

  this.days = newDays;
  this.emit();
}

  addActivity(day: DayItinerary): void {
    day.activities.push({ name: '', time: '00:00' });
    this.emit();
  }

  removeActivity(day: DayItinerary, index: number): void {
    day.activities.splice(index, 1);
    this.emit();
  }

  removeDay(index: number): void {
    this.days.splice(index, 1);
    this.emit();
  }

  onInput(): void {
    this.emit();
  }

  private emit(): void {
    this.itineraryChange.emit(this.days);
  }
}
