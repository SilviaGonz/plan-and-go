import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);

  userInitial = '';

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user?.displayName) {
        this.userInitial = user.displayName.charAt(0).toUpperCase();
      }
    });
  }
}