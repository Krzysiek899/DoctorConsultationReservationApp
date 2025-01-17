import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Day } from '../../../models/day.model';
import {AsyncPipe, NgClass, NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-day-calendar',
  templateUrl: './day-calendar.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    NgStyle,
    NgClass,
    NgIf
  ],
  styleUrls: ['./day-calendar.component.css']
})
export class DayCalendarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) day!: Day;
  slots: string[] = [];
  currentHour: string = ''; // Przechowuje bieżącą godzinę
  currentHourPosition: number = 0; // Obliczona pozycja dla linii
  private intervalId: any;

  constructor() {
    this.generateTimes();
  }

  ngOnInit(): void {
    this.setCurrentHour();
    // Ustawienie interwału, który będzie aktualizował bieżącą godzinę i pozycję
    this.intervalId = setInterval(() => {
      this.setCurrentHour();
    }, 60000); // Co minutę
  }

  ngOnDestroy(): void {
    // Usunięcie interwału po zniszczeniu komponentu
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  generateTimes(): void {
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? '0' + i : i.toString();
      this.slots.push(`${hour}:00`);
      this.slots.push(`${hour}:30`);
    }
  }

  setCurrentHour(): void {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    const currentHourStr = `${currentHour < 10 ? '0' + currentHour : currentHour}:${currentMinute >= 30 ? '30' : '00'}`;

    // Obliczanie pozycji w pikselach dla linii (np. 1 godzina = 60px)
    const positionInPixels = currentHour * 102 + currentMinute * 2;

    this.currentHour = currentHourStr;
    this.currentHourPosition = positionInPixels;
  }
}
