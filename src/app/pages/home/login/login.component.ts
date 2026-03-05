import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormInputComponent } from '../../../components/form-input/form-input.component';
import { ButtonWithBgComponent } from '../../../components/button-with-bg/button-with-bg.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, FormInputComponent, ButtonWithBgComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  errorMessage = '';
  successMessage = '';
  loading = false;

  get emailControl() { return this.form.get('email') as FormControl; }
  get passwordControl() { return this.form.get('password') as FormControl; }

  async onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    try {
      const { email, password } = this.form.value;
      await this.authService.login(email, password);
      this.form.reset();
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);
    } catch (error: any) {
        this.errorMessage = this.getErrorMessage(error.code);
    } finally {
      this.loading = false;
    }
  }

  getErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Email o contraseña incorrectos';
    case 'auth/user-not-found':
      return 'No existe ninguna cuenta con este email';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Inténtalo más tarde';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido deshabilitada';
    default:
      return 'Ha ocurrido un error. Inténtalo de nuevo';
  }
}
}
