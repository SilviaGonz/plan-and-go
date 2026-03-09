import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private openProposeTravelModal$ = new Subject<void>();

  openProposeTravelModal = this.openProposeTravelModal$.asObservable();

  triggerProposeTravelModal() {
    this.openProposeTravelModal$.next();
  }
}
