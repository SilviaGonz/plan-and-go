import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../models/message';
import { Subscription } from 'rxjs';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-trip-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-chat.component.html',
  styleUrl: './trip-chat.component.css'
})
export class TripChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() travelId: string = '';
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private chatService = inject(ChatService);
  private auth = inject(Auth);
  private uiService = inject(UiService);
private subscription = new Subscription();
searchQuery = '';

  messages: Message[] = [];
  newMessage = '';
  private unsubscribe?: () => void;
  private shouldScroll = false;

  get currentUserId(): string {
    return this.auth.currentUser?.uid || '';
  }

  ngOnInit(): void {
    this.unsubscribe = this.chatService.listenMessages(this.travelId, messages => {
      this.messages = messages;
      this.shouldScroll = true;
    });

      this.subscription.add(
    this.uiService.searchQuery.subscribe(query => {
      this.searchQuery = query;
    })
  );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe?.();
    this.subscription.unsubscribe();
  }

  get filteredMessages(): Message[] {
  if (!this.searchQuery.trim()) return this.messages;
  const q = this.searchQuery.toLowerCase();
  return this.messages.filter(m =>
    m.text.toLowerCase().includes(q) ||
    m.userName.toLowerCase().includes(q)
  );
}

  async send(): Promise<void> {
    const text = this.newMessage.trim();
    if (!text) return;
    this.newMessage = '';
    await this.chatService.sendMessage(this.travelId, text);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }

  formatDate(date: Date): string {
    return date.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
