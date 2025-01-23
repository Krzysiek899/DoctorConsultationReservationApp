import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {WeekCalendarComponent} from './components/calendar/week-calendar/week-calendar.component';
import {MenuBarComponent} from './components/navigation/menu-bar/menu-bar.component';
import {LoginComponent} from './components/auth/login/login.component';
import {AuthService} from './services/auth/auth.service';
import {AuthFireService} from './services/auth/fire/auth-fire.service';
import {DatabaseFireService} from './services/database/fire/database-fire.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuBarComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'DoctorConsultationReservationApp';

  //constructor(private authService: AuthFireService) {}

  // ngOnInit() {
  //   this.authService.subscribe();
  // }
}
