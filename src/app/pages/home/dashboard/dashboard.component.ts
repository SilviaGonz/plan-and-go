import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../components/header/header.component';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { SummaryCardComponent } from "../../../components/summary-card/summary-card.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, SummaryCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private auth = inject(Auth);

  firstName = ''; 

    ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user?.displayName) {
        this.firstName = user.displayName.split(' ')[0];
      }
    });
  }

}
