import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { HeaderComponent } from '../../../components/header/header.component';
import { TravelService } from '../../../services/travel.service';
import { ActivityService } from '../../../services/activity.service';
import { UiService } from '../../../services/ui.service';
import { Travel } from '../../../models/travel';
import { Activity } from '../../../models/activity';
import { ProposeActivityModalComponent } from '../../../components/propose-activity-modal/propose-activity-modal.component';
import { ProposeTravelModalComponent } from '../../../components/propose-travel-modal/propose-travel-modal.component';

@Component({
  selector: 'app-trip-detail',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ProposeActivityModalComponent, ProposeTravelModalComponent],
  templateUrl: './trip-detail.component.html',
  styleUrl: './trip-detail.component.css'
})
export class TripDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private travelService = inject(TravelService);
  private activityService = inject(ActivityService);
  private auth = inject(Auth);
  private uiService = inject(UiService);
  private subscription = new Subscription();

  travel: Travel | null = null;
  activities: Activity[] = [];
  activeTab: 'actividades' | 'calendario' | 'gastos' | 'chat' = 'actividades';
  showProposeModal = false;
  showNewTravelModal = false;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.travel = await this.travelService.getTravelById(id);
      await this.loadActivities(id);
    }

    this.route.fragment.subscribe(fragment => {
      if (fragment === 'gastos') this.activeTab = 'gastos';
      else if (fragment === 'actividades') this.activeTab = 'actividades';
    });

    this.subscription.add(
      this.uiService.openProposeTravelModal.subscribe(() => {
        this.showNewTravelModal = true;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async loadActivities(travelId: string) {
    this.activities = await this.activityService.getActivities(travelId);
  }

  async onActivityCreated() {
    if (this.travel?.id) await this.loadActivities(this.travel.id);
  }

  async vote(activityId: string, type: 'up' | 'down') {
    await this.activityService.vote(activityId, type);
    if (this.travel?.id) await this.loadActivities(this.travel.id);
  }

  get currentUserId(): string {
    return this.auth.currentUser?.uid || '';
  }

  getVotingLabel(activity: Activity): string {
    if (activity.votingStatus === 'closed') return 'Votación finalizada';
    const total = activity.votesUp.length + activity.votesDown.length;
    const max = this.travel?.membersCount || 0;
    return `Votación en curso: ${total}/${max} votos`;
  }

  isVotingUrgent(activity: Activity): boolean {
    if (activity.votingStatus === 'closed') return false;
    return activity.votesUp.length + activity.votesDown.length === 0;
  }
}
