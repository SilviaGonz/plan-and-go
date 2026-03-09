import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-selector.component.html',
  styleUrl: './icon-selector.component.css'
})
export class IconSelectorComponent {
  @Input() selected: string = '';
  @Output() selectedChange = new EventEmitter<string>();

  icons = [
    'bi-brightness-high',
    'bi-bank',
    'bi-tree',
    'bi-dribbble',
    'bi-egg-fried',
    'bi-music-note-beamed',
    'bi-briefcase',
  ];

  select(icon: string) {
    this.selected = icon;
    this.selectedChange.emit(icon);
  }
}
