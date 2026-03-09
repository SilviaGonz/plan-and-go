import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form-textarea.component.html',
  styleUrl: './form-textarea.component.css'
})
export class FormTextareaComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() maxLength: number = 200;
  @Input() control!: AbstractControl;
  @Input() errorMessage: string = '';

  get formControl(): FormControl {
    return this.control as FormControl;
  }
}
