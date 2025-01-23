import {Component, OnInit} from '@angular/core';
import {DayCalendarComponent} from '../day-calendar/day-calendar.component';
import {DateService} from '../../../services/dates/date.service';
import {Day} from '../../../models/day.model';
import {MatIcon} from "@angular/material/icon";
import { ActivatedRoute } from '@angular/router'
import {Observable} from 'rxjs';


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

  paramValue: string | null = '';
  days: Day[] = [];
  currentStartDate: Date = new Date();

  constructor(private dateService: DateService, public activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.updateDays();

    this.paramValue = this.activatedRoute.snapshot.paramMap.get('doctorId');
    console.log(this.paramValue);
  }

  updateDays(): void {
    this.days = this.dateService.GetDays(this.currentStartDate);
  }

  shiftDays(offset: number): void {
    this.currentStartDate.setDate(this.currentStartDate.getDate() + offset);
    this.updateDays();
  }
}
