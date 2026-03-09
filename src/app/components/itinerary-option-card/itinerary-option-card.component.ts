import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-itinerary-option-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './itinerary-option-card.component.html',
  styleUrl: './itinerary-option-card.component.css'
})
export class ItineraryOptionCardComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() value: string = '';
  @Input() selected: boolean = false;
  @Output() select = new EventEmitter<string>();
}
