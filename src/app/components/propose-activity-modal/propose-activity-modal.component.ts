import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl, FormsModule } from '@angular/forms';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormTextareaComponent } from '../form-textarea/form-textarea.component';
import { IconSelectorComponent } from '../icon-selector/icon-selector.component';
import { ActivityService } from '../../services/activity.service';
import { Auth } from '@angular/fire/auth';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-propose-activity-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FormInputComponent, FormTextareaComponent, IconSelectorComponent],
  templateUrl: './propose-activity-modal.component.html',
  styleUrl: './propose-activity-modal.component.css'
})
export class ProposeActivityModalComponent {
  @Input() travelId: string = '';
  @Input() travelName: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Input() minDate: string = '';
  @Input() maxDate: string = '';

  private fb = inject(FormBuilder);
  private activityService = inject(ActivityService);
  private auth = inject(Auth);
  private storage = inject(Storage);

  activityIcons = [
  'bi-egg-fried',
  'bi-music-note-beamed',
  'bi-gift',
  'bi-bank',
  'bi-tree',
  'bi-person-walking',
  'bi-cup-straw',
];

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    activityLevel: ['bajo', Validators.required],
    location: ['', Validators.required],
    link: [''],
    suggestedDate: ['', Validators.required],
    startTime: ['', Validators.required],
    duration: ['1 hora', Validators.required],
    costPerPerson: [0],
    requiresReservation: [false],
    notes: [''],
  });

  selectedIcon = 'bi-compass';
  imageUrls: string[] = [];
  uploadingImage = false;
  loading = false;
  errorMessage = '';

  get titleControl() { return this.form.get('title') as FormControl; }
  get descriptionControl() { return this.form.get('description') as FormControl; }
  get locationControl() { return this.form.get('location') as FormControl; }
  get linkControl() { return this.form.get('link') as FormControl; }
  get suggestedDateControl() { return this.form.get('suggestedDate') as FormControl; }
  get startTimeControl() { return this.form.get('startTime') as FormControl; }
  get costPerPersonControl() { return this.form.get('costPerPerson') as FormControl; }
  get notesControl() { return this.form.get('notes') as FormControl; }

  today = new Date().toISOString().split('T')[0];

  async onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.uploadingImage = true;
    try {
      for (const file of Array.from(input.files)) {
        const storageRef = ref(this.storage, `activities/${Date.now()}_${file.name}`);
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
    if (this.form.invalid) return;
    this.loading = true;
    try {
      const user = this.auth.currentUser;
      const v = this.form.value;
      await this.activityService.createActivity({
        travelId: this.travelId,
        title: v.title!,
        description: v.description || '',
        icon: this.selectedIcon,
        activityLevel: v.activityLevel as 'bajo' | 'medio' | 'alto',
        location: v.location || '',
        link: v.link || '',
        suggestedDate: v.suggestedDate || '',
        startTime: v.startTime || '',
        duration: v.duration || '',
        costPerPerson: Number(v.costPerPerson) || 0,
        requiresReservation: v.requiresReservation || false,
        notes: v.notes || '',
        images: this.imageUrls,
        proposedBy: user?.uid || '',
        proposedByName: user?.displayName || 'Anónimo',
        votesUp: [],
        votesDown: [],
        votingStatus: 'open',
      });
      this.created.emit();
      this.close.emit();
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.loading = false;
    }
  }
}
