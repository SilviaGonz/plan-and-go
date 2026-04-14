import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private openProposeTravelModal$ = new Subject<void>();
  openProposeTravelModal = this.openProposeTravelModal$.asObservable();

  private searchQuery$ = new BehaviorSubject<string>('');
  searchQuery = this.searchQuery$.asObservable();

  private activeTab$ = new BehaviorSubject<string>('');
  activeTab = this.activeTab$.asObservable();

  triggerProposeTravelModal() {
    this.openProposeTravelModal$.next();
  }

  setSearchQuery(query: string): void {
    this.searchQuery$.next(query);
  }

  clearSearchQuery(): void {
    this.searchQuery$.next('');
  }

  setActiveTab(tab: string): void {
    this.activeTab$.next(tab);
  }
}
