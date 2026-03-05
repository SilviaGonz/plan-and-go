import { Component, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-button-with-bg',
  standalone: true,
  imports: [RouterLink, NgStyle],
  templateUrl: './button-with-bg.component.html',
  styleUrl: './button-with-bg.component.css',
})
export class ButtonWithBgComponent {
  @Input() text: string = '';
  @Input() route: string = '';
  @Input() color: string = 'var(--color-primary)';
  @Input() type: string = 'button';
  @Input() disabled: boolean = false;
  @Input() loadingText: string = '';
  @Input() variant: 'filled' | 'outline' = 'filled';
}
