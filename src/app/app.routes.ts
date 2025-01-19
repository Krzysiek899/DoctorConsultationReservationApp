import { Routes } from '@angular/router';
import {AuthGuard} from '@angular/fire/auth-guard';
import {PublicLayoutComponent} from './layouts/public-layout/public-layout.component';
import {LoginComponent} from './components/auth/login/login.component';
import {RegisterComponent} from './components/auth/register/register.component';
import {DoctorListComponent} from './components/doctors/doctor-list/doctor-list.component';
import {UnauthorizedLayoutComponent} from './layouts/unauthorized-layout/unauthorized-layout.component';
import {WeekCalendarComponent} from './components/calendar/week-calendar/week-calendar.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DoctorListComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'calendar',
    component: WeekCalendarComponent
  }
]

// export const routes: Routes = [
//   // Widoki dla użytkowników niezalogowanych
//   { path: '', component: PublicLayoutComponent, children: [
//       { path: '', component: DoctorListComponent },
//       { path: 'login', component: LoginComponent },
//       { path: 'register', component: RegisterComponent }
//     ]},
//   // // Widoki dla zalogowanych lekarzy
//   // { path: 'doctor', component: DoctorLayoutComponent, canActivate: [AuthGuard, DoctorGuard], children: [
//   //     { path: 'calendar', component: DoctorCalendarComponent },
//   //     { path: 'availability', component: DoctorAvailabilityComponent },
//   //     { path: 'absences', component: DoctorAbsencesComponent }
//   //   ]},
//   // // Widoki dla zalogowanych pacjentów
//   // { path: 'patient', component: PatientLayoutComponent, canActivate: [AuthGuard, PatientGuard], children: [
//   //     { path: 'consultations', component: PatientConsultationsComponent },
//   //     { path: 'doctors', component: DoctorListComponent }
//   //   ]},
//   // Strony błędów i przekierowania
//   { path: 'unauthorized', component: UnauthorizedLayoutComponent },
//   { path: '**', redirectTo: '' }
// ];

