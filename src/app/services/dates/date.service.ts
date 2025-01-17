import { Injectable } from '@angular/core';
import {Day} from '../../models/day.model';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  GetDays(startDate: Date): Day[] {
    const daysOfWeek: Day[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(this.DateToDay(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return daysOfWeek;
  }

  DateToDay(date: Date): Day {
    const today = new Date();
    return {
      day: date.getDate(),
      dayOfWeek: this.getDayOfWeek(date.getDay()),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      isCurrent: today.toDateString() === date.toDateString(),
    };
  }

  getDayOfWeek(day: number): string {
    const daysOfWeek = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    return daysOfWeek[day];
  }

}
