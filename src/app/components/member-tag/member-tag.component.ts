import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-member-tag',
  standalone: true,
  templateUrl: './member-tag.component.html',
  styleUrl: './member-tag.component.css'
})
export class MemberTagComponent {
  @Input() email: string = '';
  @Output() remove = new EventEmitter<string>();

  get initial(): string {
    return this.email.charAt(0).toUpperCase();
  }
}
