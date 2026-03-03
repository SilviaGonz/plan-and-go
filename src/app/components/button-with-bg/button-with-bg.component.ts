import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-button-with-bg',
  standalone: true,
  imports: [RouterLink, NgStyle],
  templateUrl: './button-with-bg.component.html',
  styleUrl: './button-with-bg.component.css'
})
export class ButtonWithBgComponent {
  @Input() text: string = '';
  @Input() route: string = '';
  @Input() color: string = 'var(--color-primary)';
}
