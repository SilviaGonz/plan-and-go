import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-notification.component.html',
  styleUrl: './toast-notification.component.css'
})
export class ToastNotificationComponent implements OnInit {
  @Input() message: string = '';
  @Input() submessage: string = '';
  @Input() icon: string = 'bi-trash';
  @Input() type: 'error' | 'success' | 'warning' = 'error';
  @Output() closed = new EventEmitter<void>();

  ngOnInit() {
    setTimeout(() => this.closed.emit(), 4000);
  }
}