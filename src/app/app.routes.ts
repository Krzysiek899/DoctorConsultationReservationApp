import { Routes } from '@angular/router';
import {AuthGuard} from '@angular/fire/auth-guard';
import {LoginComponent} from './components/auth/login/login.component';
import {RegisterComponent} from './components/auth/register/register.component';
import {DoctorListComponent} from './components/doctors/doctor-list/doctor-list.component';
import {WeekCalendarComponent} from './components/calendar/week-calendar/week-calendar.component';
import {AddAvailabilityComponent} from './components/add-forms/add-availability/add-availability.component';
import {AddAbsenceComponent} from './components/add-forms/add-absence/add-absence.component';
import {AddConsultationComponent} from './components/add-forms/add-consultation/add-consultation.component';

export const routes: Routes = [
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
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'mycalendar',
    component: WeekCalendarComponent
  },
  {
    path: 'newavailability',
    component: AddAvailabilityComponent
  },
  {
    path: 'newabsence',
    component: AddAbsenceComponent
  },
  {
    path: 'newconsultation',
    component: AddConsultationComponent
  },
  {
    path:'doctors/:doctorId',
    component: WeekCalendarComponent,
  },
  {
    path: 'doctors/:doctorId/newconsultation',
    component: AddConsultationComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
  // {
  //   path: "newconsultation",
  // }
  // {
  //   path: "basket",
  //
  // }

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

