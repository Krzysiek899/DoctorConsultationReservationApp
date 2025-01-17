import { Injectable } from '@angular/core';
import {Day} from '../../models/day.model';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  constructor() { }

  public GetDays(): Day[] {
    const today = new Date();
    const daysOfWeek: Day[] = [];

    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);

    let currentDay = new Date(today);
    currentDay.setDate(today.getDate() - diffToMonday);

    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(this.DateToDay(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return daysOfWeek;
  }

  private DateToDay(date: Date): Day {
    const today = new Date();

    const day: Day = {
      day: date.getDate(),
      dayOfWeek: date.getDay(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      isCurrent:
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    };

    return day;
  }

}
