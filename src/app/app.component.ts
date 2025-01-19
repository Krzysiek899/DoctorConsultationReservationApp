import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WeekCalendarComponent} from './components/calendar/week-calendar/week-calendar.component';
import {MenuBarComponent} from './components/navigation/menu-bar/menu-bar.component';
import {LoginComponent} from './components/auth/login/login.component';
import {PublicLayoutComponent} from './layouts/public-layout/public-layout.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuBarComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DoctorConsultationReservationApp';
}
