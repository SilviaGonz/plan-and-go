import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { SummaryCardComponent } from '../../../components/summary-card/summary-card.component';
import { ProposeTravelModalComponent } from '../../../components/propose-travel-modal/propose-travel-modal.component';
import { UiService } from '../../../services/ui.service';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../../../components/header/header.component';
import { Travel } from '../../../models/travel';
import { TravelService } from '../../../services/travel.service';
import { ButtonWithBgComponent } from "../../../components/button-with-bg/button-with-bg.component";
import { TripCardComponent } from "../../../components/trip-card/trip-card.component";
import { DeleteTravelModalComponent } from "../../../components/delete-travel-modal/delete-travel-modal.component";
import { ToastNotificationComponent } from "../../../components/toast-notification/toast-notification.component";
import { ArchiveTravelModalComponent } from "../../../components/archive-travel-modal/archive-travel-modal.component";
import { ArchivedTripCardComponent } from "../../../components/archived-trip-card/archived-trip-card.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SummaryCardComponent, ProposeTravelModalComponent, HeaderComponent, ButtonWithBgComponent, TripCardComponent, DeleteTravelModalComponent, ToastNotificationComponent, ArchiveTravelModalComponent, ArchiveTravelModalComponent, ArchivedTripCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private uiService = inject(UiService);
  private subscription = new Subscription();
  private travelService = inject(TravelService);


  firstName = '';
  showModal = false;
  travels: Travel[] = [];
  nextTrip: Travel | null = null;

 ngOnInit() {
  onAuthStateChanged(this.auth, async (user) => {
    console.log('usuario:', user);
    if (user?.displayName) {
      this.firstName = user.displayName.split(' ')[0];
    }
    if (user) {
      console.log('llamando a loadTravels...');
      await this.loadTravels();
    } else {
      console.log('no hay usuario');
    }
  });

  this.subscription.add(
    this.uiService.openProposeTravelModal.subscribe(() => {
      this.showModal = true;
    })
  );
}

async loadTravels() {
  try {
    this.travels = await this.travelService.getUserTravels();
    this.archivedTravels = await this.travelService.getArchivedTravels();
    this.archivedCount = this.archivedTravels.length;
    this.nextTrip = this.travelService.getNextTrip(this.travels);
  } catch (error) {
    console.error('error cargando viajes:', error);
  }
}

  get daysUntilNextTrip(): number {
    if (!this.nextTrip) return 0;
    const today = new Date();
    const diff = this.nextTrip.startDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  get formattedDates(): string {
    if (!this.nextTrip) return '';
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const start = this.nextTrip.startDate.toLocaleDateString('es-ES', options);
    const end = this.nextTrip.endDate.toLocaleDateString('es-ES', options);
    return `${start} - ${end}`;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async onTravelCreated(id: string) {
    console.log('Viaje creado con id:', id);
    this.showModal = false;
    await this.loadTravels();
}

  get activeTrips(): number {
    const today = new Date();
    return this.travels.filter(t => t.endDate > today).length;
  }

  editingTravel: Travel | null = null;
  showEditModal = false;

  async onEditTrip(id: string) {
    this.editingTravel = await this.travelService.getTravelById(id);
    this.showEditModal = true;
  }

  deletingTravel: Travel | null = null;
  showDeleteModal = false;

  async onDeleteTrip(id: string) {
    this.deletingTravel = await this.travelService.getTravelById(id);
    this.showDeleteModal = true;
  }

  showToast = false;

 async confirmDelete() {
  if (!this.deletingTravel?.id) return;
  try {
    await this.travelService.deleteTravel(this.deletingTravel.id);
    this.showDeleteModal = false;
    this.deletingTravel = null;
    await this.loadTravels();
    this.toastMessage = 'Viaje eliminado permanentemente';
    this.toastSubmessage = 'Esta acción no se puede deshacer';
    this.toastType = 'error';
    this.toastIcon = 'bi-trash';
    this.showToast = true;
  } catch (error) {
    console.error('error eliminando viaje:', error);
  }
}

  async onTravelUpdated(id: string) {
    this.showEditModal = false;
    this.editingTravel = null;
    await this.loadTravels();
  }

  archivingTravel: Travel | null = null;
showArchiveModal = false;
showArchivedModal = false;
archivedTravels: Travel[] = [];
archivedCount = 0;

async onArchiveTrip(id: string) {
  this.archivingTravel = await this.travelService.getTravelById(id);
  this.showArchiveModal = true;
}

toastMessage = '';
toastSubmessage = '';
toastType: 'error' | 'success' | 'warning' = 'error';
toastIcon = 'bi-trash';

async confirmArchive() {
  if (!this.archivingTravel?.id) return;
  await this.travelService.archiveTravel(this.archivingTravel.id);
  this.showArchiveModal = false;
  this.archivingTravel = null;
  await this.loadTravels();
  this.showToast = true;
  this.toastMessage = 'Viaje archivado correctamente';
  this.toastSubmessage = 'Puedes restaurarlo desde "Viajes archivados"';
  this.toastType = 'success';
  this.toastIcon = 'bi-check2-square';
}

async onRestoreTrip(id: string) {
  await this.travelService.restoreTravel(id);
  await this.loadTravels();
  if (this.archivedTravels.length === 0) {
    this.showingArchived = false;
  }
  this.toastMessage = 'Viaje restaurado correctamente';
  this.toastSubmessage = 'Puedes verlo desde "Tus viajes"';
  this.toastType = 'success';
  this.toastIcon = 'bi-check2-square';
  this.showToast = true;
}

showingArchived = false;

async openArchivedModal() {
  this.archivedTravels = await this.travelService.getArchivedTravels();
  this.showingArchived = true;
}


}
