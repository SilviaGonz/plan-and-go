import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormInputComponent } from '../../../components/form-input/form-input.component';
import { ButtonWithBgComponent } from '../../../components/button-with-bg/button-with-bg.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, FormInputComponent, ButtonWithBgComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    terms: [false, Validators.requiredTrue]
  }, { validators: this.passwordsMatch });

  errorMessage = '';
  loading = false;

  get nameControl() { return this.form.get('name') as FormControl; }
  get emailControl() { return this.form.get('email') as FormControl; }
  get passwordControl() { return this.form.get('password') as FormControl; }
  get confirmPasswordControl() { return this.form.get('confirmPassword') as FormControl; }

  passwordsMatch(group: AbstractControl) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  successMessage = '';

  async onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
      this.loading = true;
      this.errorMessage = '';
    try {
      const { name, email, password } = this.form.value;
      await this.authService.register(name, email, password);
      this.successMessage = '¡Cuenta creada correctamente! Redirigiendo a inicio de sesión...';
      this.form.reset();
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.loading = false;
  }
}
}
