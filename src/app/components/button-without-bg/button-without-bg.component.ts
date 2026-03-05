import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button-without-bg',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './button-without-bg.component.html',
  styleUrl: './button-without-bg.component.css'
})
export class ButtonWithoutBgComponent {
  @Input() text: string = '';
  @Input() route: string = '';
}
