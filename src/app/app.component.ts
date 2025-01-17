import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WeekCalendarComponent} from './components/calendar-components/week-calendar/week-calendar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WeekCalendarComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DoctorConsultationReservationApp';
}
