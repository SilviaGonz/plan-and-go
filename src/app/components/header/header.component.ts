import { Component, inject, OnInit, HostListener } from '@angular/core';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { Auth, onAuthStateChanged, signOut, deleteUser } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { UiService } from '../../services/ui.service';
import { FormsModule } from '@angular/forms';
import { DeleteAccountModalComponent } from '../delete-account-modal/delete-account-modal.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, DeleteAccountModalComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);
  private uiService = inject(UiService);

  userInitial = '';
  searchText = '';
  isSearchDisabled = false;
  searchPlaceholder = 'Buscar viajes...';
  showProfileMenu = false;
  showDeleteAccountModal = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.header__profile')) {
      this.showProfileMenu = false;
    }
  }

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user?.displayName) {
        this.userInitial = user.displayName.charAt(0).toUpperCase();
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.searchText = '';
        this.uiService.clearSearchQuery();
        this.searchPlaceholder = 'Buscar viajes...';
      }
    });

    this.uiService.searchQuery.subscribe(query => {
      if (!query) this.searchText = '';
    });

    this.uiService.activeTab.subscribe(tab => {
      this.isSearchDisabled = tab === 'calendario';
      if (this.isSearchDisabled) {
        this.searchText = '';
        this.uiService.clearSearchQuery();
      }
      switch (tab) {
        case 'actividades': this.searchPlaceholder = 'Buscar actividades...'; break;
        case 'gastos': this.searchPlaceholder = 'Buscar gastos...'; break;
        case 'chat': this.searchPlaceholder = 'Buscar mensajes...'; break;
        case 'calendario': this.searchPlaceholder = 'Búsqueda no disponible'; break;
        default: this.searchPlaceholder = 'Buscar viajes...'; break;
      }
    });
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  async deleteAccount() {
    this.showDeleteAccountModal = false;
    try {
      const user = this.auth.currentUser;
      if (user) {
        await deleteUser(user);
        this.router.navigate(['/login']);
      }
    } catch (e: any) {
      alert('Error al eliminar la cuenta. Por favor vuelve a iniciar sesión e inténtalo de nuevo.');
    }
  }

  openNewTrip() {
    this.uiService.triggerProposeTravelModal();
  }

  onSearch(): void {
    this.uiService.setSearchQuery(this.searchText);
  }
}
