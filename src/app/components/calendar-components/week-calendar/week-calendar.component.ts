import {Component, OnInit} from '@angular/core';
import {DayCalendarComponent} from '../day-calendar/day-calendar.component';
import {DateService} from '../../../services/dates/date.service';
import {Day} from '../../../models/day.model';

@Component({
  selector: 'app-week-calendar',
  imports: [
    DayCalendarComponent
  ],
  templateUrl: './week-calendar.component.html',
  standalone: true,
  styleUrl: './week-calendar.component.css',
  providers: [
    DateService
  ]
})
export class WeekCalendarComponent implements OnInit {

  days : Day[] = []
  constructor(private dateService: DateService) {}

  ngOnInit() {
    this.days = this.dateService.GetDays();
  }

}
