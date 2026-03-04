import { Routes } from '@angular/router';
import { HomeComponent } from '../app/pages/home/home/home.component';
import { RegisterComponent } from './pages/home/register/register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent }
];
