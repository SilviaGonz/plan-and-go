import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { InvitationService } from '../../../services/invitation.service';
import { Invitation } from '../../../models/invitation';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invite.component.html',
  styleUrl: './invite.component.css'
})
export class InviteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);
  private invitationService = inject(InvitationService);

  invitation: Invitation | null = null;
  loading = true;
  accepting = false;
  error = '';
  success = false;

  async ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.error = 'Enlace de invitación no válido';
      this.loading = false;
      return;
    }

    try {
      this.invitation = await this.invitationService.getInvitationByToken(token);
      if (!this.invitation) {
        this.error = 'Esta invitación no existe o ha expirado';
      }
      if (this.invitation?.status === 'accepted') {
        this.error = 'Esta invitación ya ha sido aceptada';
      }
    } catch (e) {
      this.error = 'Error al cargar la invitación';
    } finally {
      this.loading = false;
    }
  }

  async accept() {
    if (!this.invitation?.id) return;
    const user = this.auth.currentUser;
    if (!user) {
      this.router.navigate(['/login'], { queryParams: { redirect: `/invite/${this.invitation.token}` } });
      return;
    }
    this.accepting = true;
    try {
      await this.invitationService.acceptInvitation(this.invitation.id, this.invitation.travelId);
      this.success = true;
      setTimeout(() => this.router.navigate(['/dashboard']), 2000);
    } catch (e) {
      this.error = 'Error al aceptar la invitación';
    } finally {
      this.accepting = false;
    }
  }

  goHome() {
    this.router.navigate(['/dashboard']);
  }
}
