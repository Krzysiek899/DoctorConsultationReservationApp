import {Component, OnInit} from '@angular/core';
import {DayCalendarComponent} from '../day-calendar/day-calendar.component';
import {DateService} from '../../../services/dates/date.service';
import {Day} from '../../../models/day.model';
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-week-calendar',
  imports: [
    DayCalendarComponent,
    MatIcon
  ],
  templateUrl: './week-calendar.component.html',
  standalone: true,
  styleUrl: './week-calendar.component.css',
  providers: [
    DateService
  ]
})
export class WeekCalendarComponent implements OnInit {

  days: Day[] = [];
  currentStartDate: Date = new Date();

  constructor(private dateService: DateService) {}

  ngOnInit(): void {
    this.updateDays();
  }

  updateDays(): void {
    this.days = this.dateService.GetDays(this.currentStartDate);
  }

  shiftDays(offset: number): void {
    this.currentStartDate.setDate(this.currentStartDate.getDate() + offset);
    this.updateDays();
  }
}
