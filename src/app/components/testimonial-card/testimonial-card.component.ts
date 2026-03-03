import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-testimonial-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-card.component.html',
  styleUrl: './testimonial-card.component.css'
})
export class TestimonialCardComponent {
  @Input() rating: number = 5;
  @Input() text: string = '';
  @Input() name: string = '';
  @Input() role: string = '';

  get stars() {
    return Array(5).fill(0).map((_, i) => i < this.rating);
  }

  get initials() {
    return this.name.split(' ')[0][0].toUpperCase();
  }
}
