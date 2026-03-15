import { Routes } from '@angular/router';
import { HomeComponent } from '../app/pages/home/home/home.component';
import { RegisterComponent } from './pages/home/register/register.component';
import { LoginComponent } from './pages/home/login/login.component';
import { DashboardComponent } from './pages/home/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'trips/:id', loadComponent: () => import('./pages/home/trip-detail/trip-detail.component').then(m => m.TripDetailComponent) },
  { path: 'invite/:token', loadComponent: () => import('./pages/home/invite/invite.component').then(m => m.InviteComponent) },
];
