import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Travel, DayItinerary } from '../../models/travel';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isTripDay: boolean;
  itinerary?: DayItinerary;
}

@Component({
  selector: 'app-trip-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-calendar.component.html',
  styleUrl: './trip-calendar.component.css'
})
export class TripCalendarComponent implements OnChanges {
  @Input() travel: Travel | null = null;

  currentDate = new Date();
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  selectedDay: CalendarDay | null = null;
  weeks: CalendarDay[][] = [];

  readonly weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['travel'] && this.travel) {
      this.currentMonth = this.travel.startDate.getMonth();
      this.currentYear = this.travel.startDate.getFullYear();
      this.buildCalendar();
    }
  }

  get monthLabel(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleDateString('es-ES', {
      month: 'long', year: 'numeric'
    }).replace(/^\w/, c => c.toUpperCase());
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.buildCalendar();
  }

  selectDay(day: CalendarDay): void {
    if (!day.isTripDay) {
      this.selectedDay = null;
      return;
    }
    this.selectedDay = this.selectedDay?.date.toDateString() === day.date.toDateString() ? null : day;
  }

  private buildCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);

    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: CalendarDay[] = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth, -i);
      days.push(this.buildDay(date, false));
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(this.currentYear, this.currentMonth, d);
      days.push(this.buildDay(date, true));
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const date = new Date(this.currentYear, this.currentMonth + 1, i);
        days.push(this.buildDay(date, false));
      }
    }

    this.weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      this.weeks.push(days.slice(i, i + 7));
    }
  }

  private buildDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const today = new Date();
    const isTripDay = this.travel
      ? date >= this.normalizeDate(this.travel.startDate) &&
        date <= this.normalizeDate(this.travel.endDate)
      : false;

    const itinerary = isTripDay
      ? this.travel?.itinerary?.find(d => {
          const itDate = new Date(d.date);
          return new Date(itDate.getUTCFullYear(), itDate.getUTCMonth(), itDate.getUTCDate())
            .toDateString() === date.toDateString();
        })
      : undefined;

    return {
      date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isToday: date.toDateString() === today.toDateString(),
      isTripDay,
      itinerary
    };
  }

  private normalizeDate(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
