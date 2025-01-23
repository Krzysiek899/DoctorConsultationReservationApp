import { Routes } from '@angular/router';
import {AuthGuard, hasCustomClaim, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import {LoginComponent} from './components/auth/login/login.component';
import {RegisterComponent} from './components/auth/register/register.component';
import {DoctorListComponent} from './components/doctors/doctor-list/doctor-list.component';
import {WeekCalendarComponent} from './components/calendar/week-calendar/week-calendar.component';
import {AddAvailabilityComponent} from './components/add-forms/add-availability/add-availability.component';
import {AddAbsenceComponent} from './components/add-forms/add-absence/add-absence.component';
import {AddConsultationComponent} from './components/add-forms/add-consultation/add-consultation.component';
import {CartComponent} from './components/cart/cart.component';
import {roleGuard} from './role.guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToCalendar = () => redirectLoggedInTo(['mycalendar']);


export const routes: Routes = [
  // Dostępne dla wszystkich
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'doctors',
  },
  {
    path: 'doctors',
    component: DoctorListComponent
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard], // Użytkownicy zalogowani zostaną przekierowani do mycalendar
    data: { authGuardPipe: redirectLoggedInToCalendar }
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToCalendar }
  },

  // Dostępne tylko dla zalogowanych użytkowników
  {
    path: 'mycalendar',
    component: WeekCalendarComponent,
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin }
  },

  // Trasy dostępne tylko dla lekarzy
  {
    path: 'newavailability',
    component: AddAvailabilityComponent,
    canActivate: [AuthGuard, roleGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin, role: 'doctor' }
  },
  {
    path: 'newabsence',
    component: AddAbsenceComponent,
    canActivate: [AuthGuard, roleGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin, role: 'doctor' }
  },

  // Trasy dostępne tylko dla pacjentów
  {
    path: 'doctors/:doctorId/newconsultation',
    component: AddConsultationComponent,
    canActivate: [AuthGuard, roleGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin, role: 'patient' }
  },
  {
    path: 'doctors/:doctorId',
    component: WeekCalendarComponent,
    canActivate: [AuthGuard, roleGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin, role: 'patient'}
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [AuthGuard, roleGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin, role: 'patient' }
  },

  // Przekierowanie dla nieznanych ścieżek
  {
    path: '**',
    redirectTo: ''
  }
];

