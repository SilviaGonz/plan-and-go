import { Component, Output, EventEmitter, inject, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormTextareaComponent } from '../form-textarea/form-textarea.component';
import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { ItineraryOptionCardComponent } from '../itinerary-option-card/itinerary-option-card.component';
import { MemberTagComponent } from '../member-tag/member-tag.component';
import { TravelService } from '../../services/travel.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Travel, DayItinerary } from '../../models/travel';
import { ItineraryBuilderComponent } from '../itinerary-builder/itinerary-builder.component';
import { ItineraryIaBuilderComponent } from '../itinerary-ia-builder/itinerary-ia-builder.component';

@Component({
  selector: 'app-propose-travel-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormInputComponent,
    FormTextareaComponent,
    IconSelectorComponent,
    ItineraryOptionCardComponent,
    MemberTagComponent,
    ItineraryBuilderComponent,
    ItineraryIaBuilderComponent,
],
  templateUrl: './propose-travel-modal.component.html',
  styleUrl: './propose-travel-modal.component.css'
})
export class ProposeTravelModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<string>();

  private fb = inject(FormBuilder);
  private travelService = inject(TravelService);
  private storage = inject(Storage);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    membersCount: ['', [Validators.required, Validators.min(1)]],
    notes: [''],
  });

  selectedIcon = 'bi-compass';
  selectedItinerary = '';
  members: string[] = [];
  memberEmail = '';
  loading = false;
  errorMessage = '';
  today = new Date().toISOString().split('T')[0];
  imageUrls: string[] = [];
  uploadingImage = false;
  manualItinerary: DayItinerary[] = [];
  aiItinerary: DayItinerary[] = [];

  get nameControl() { return this.form.get('name') as FormControl; }
  get descriptionControl() { return this.form.get('description') as FormControl; }
  get startDateControl() { return this.form.get('startDate') as FormControl; }
  get endDateControl() { return this.form.get('endDate') as FormControl; }
  get membersCountControl() { return this.form.get('membersCount') as FormControl; }
  get notesControl() { return this.form.get('notes') as FormControl; }

  get tripDuration(): string {
    const start = this.form.get('startDate')?.value;
    const end = this.form.get('endDate')?.value;
    if (!start || !end) return '';
    const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return '';
    return `Duración total del viaje: ${days} días y ${days - 1} noches`;
  }

  isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
  }

  memberEmailError = '';

  addMember() {
    if (!this.memberEmail) return;

    if (!this.isValidEmail(this.memberEmail)) {
      this.memberEmailError = 'Introduce un email válido';
      return;
  }

  if (this.members.includes(this.memberEmail)) {
    this.memberEmailError = 'Este email ya ha sido añadido';
    return;
  }

    this.members.push(this.memberEmail);
    this.memberEmail = '';
    this.memberEmailError = '';
  }

  removeMember(email: string) {
    this.members = this.members.filter(m => m !== email);
  }

  async onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadingImage = true;
    try {
      for (const file of Array.from(input.files)) {
        const storageRef = ref(this.storage, `travels/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        this.imageUrls.push(url);
      }
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.uploadingImage = false;
    }
  }

  removeImage(url: string) {
    this.imageUrls = this.imageUrls.filter(i => i !== url);
  }

  async onSubmit() {
  this.form.markAllAsTouched();
  if (this.form.invalid || !this.selectedItinerary) return;
  this.loading = true;
  this.errorMessage = '';
  try {
    const { name, description, startDate, endDate, membersCount, notes } = this.form.value;
    const travelPayload = {
      icon: this.selectedIcon,
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      itineraryType: this.selectedItinerary as 'manual' | 'ai' | 'later',
      membersCount: Number(membersCount),
      members: this.members.map(email => ({ email, status: 'pending' as 'pending' })),
      images: this.imageUrls,
      notes,
      itinerary: (this.selectedItinerary === 'manual' || this.selectedItinerary === 'ai') ? this.manualItinerary : []
     };

    console.log('manualItinerary antes de enviar:', this.manualItinerary); // 👈 aquí


    if (this.isEditMode) {
      await this.travelService.updateTravel(this.travelId!, travelPayload);
      this.created.emit(this.travelId!);
    } else {
      const id = await this.travelService.createTravel(travelPayload);
      this.created.emit(id);
    }
    this.close.emit();
  } catch (error: any) {
    this.errorMessage = error.message;
  } finally {
    this.loading = false;
  }
}

  @Input() travelId: string | null = null;
@Input() set travelData(travel: Travel | null) {
  if (travel) {
    this.form.patchValue({
      name: travel.name,
      description: travel.description,
      startDate: travel.startDate.toISOString().split('T')[0],
      endDate: travel.endDate.toISOString().split('T')[0],
      membersCount: travel.membersCount,
      notes: travel.notes,
    });
    this.selectedIcon = travel.icon;
    this.selectedItinerary = travel.itineraryType === 'ai' ? 'manual' : travel.itineraryType;
    this.members = travel.members.map(m => m.email);
    this.imageUrls = travel.images;
    this.manualItinerary = travel.itinerary ?? [];
    this.cdr.detectChanges();
  }
}

get isEditMode(): boolean {
  return !!this.travelId;
}
}
