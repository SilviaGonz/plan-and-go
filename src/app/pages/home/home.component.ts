import { Component } from '@angular/core';
import { ButtonWithBgComponent } from "../../components/button-with-bg/button-with-bg.component";
import { ButtonWithoutBgComponent } from '../../components/button-without-bg/button-without-bg.component';
import { CardComponent } from '../../components/card/card.component';
import { StepCardComponent } from '../../components/step-card/step-card.component';
import { TestimonialsComponent } from '../../components/testimonial/testimonial.component';
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ButtonWithBgComponent, ButtonWithoutBgComponent, CardComponent, StepCardComponent, TestimonialsComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
