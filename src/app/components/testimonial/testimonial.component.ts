import { Component } from '@angular/core';
import { TestimonialCardComponent } from "../testimonial-card/testimonial-card.component";

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [TestimonialCardComponent],
  templateUrl: './testimonial.component.html',
  styleUrl: './testimonial.component.css'
})
export class TestimonialsComponent {
  current = 0;

  testimonials = [
    { rating: 4, text: 'La optimización de rutas con IA es espectacular. Visitamos mucho más de lo que habríamos hecho sin la página.', name: 'Carolina Betancor', role: 'Viajera frecuente' },
    { rating: 5, text: 'Organizar el viaje con mis amigos nunca había sido tan fácil. Los gastos se dividen solos y no hay discusiones.', name: 'Marcos Reyes', role: 'Viajero aventurero' },
    { rating: 5, text: 'Las votaciones grupales son geniales, todo el mundo participa y nadie se queda fuera de las decisiones.', name: 'Laura Sánchez', role: 'Organizadora de grupos' },
    { rating: 4, text: 'El chat en tiempo real hace que la coordinación sea perfecta. Ya no necesitamos mil grupos de WhatsApp.', name: 'Pedro Molina', role: 'Viajero frecuente' },
    { rating: 5, text: 'Increíble plataforma. Nuestro viaje de fin de curso fue perfecto gracias a Plan&Go.', name: 'Ana Torres', role: 'Estudiante universitaria' },
  ];

  prev() {
    this.current = this.current === 0 ? this.testimonials.length - 1 : this.current - 1;
  }

  next() {
    this.current = this.current === this.testimonials.length - 1 ? 0 : this.current + 1;
  }

  goTo(index: number) {
    this.current = index;
  }
}
