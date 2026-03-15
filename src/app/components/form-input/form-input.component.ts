import { Component, Input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.css'
})
export class FormInputComponent {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() control!: AbstractControl;
  @Input() errorMessage: string = '';
  @Input() min: string = '';
  @Input() max: string = '';

  get formControl(): FormControl {
    return this.control as FormControl;
  }
}
