import {Component, Input, OnInit, OnDestroy, SimpleChanges, OnChanges} from '@angular/core';
import { Day } from '../../../models/day.model';
import {AsyncPipe, NgClass, NgIf, NgStyle} from '@angular/common';
import {DatabaseFireService} from '../../../services/database/fire/database-fire.service';
import {Consultation} from '../../../models/consultation.model';
import {Observable} from 'rxjs';
import {ConsultationComponent} from '../consultation/consultation.component';

@Component({
  selector: 'app-day-calendar',
  templateUrl: './day-calendar.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    NgStyle,
    NgClass,
    NgIf,
    ConsultationComponent
  ],
  styleUrls: ['./day-calendar.component.css']
})
export class DayCalendarComponent implements OnInit, OnDestroy, OnChanges{
  @Input({ required: true }) day!: Day;
  slots: string[] = [];
  currentHour: string = ''; // Przechowuje bieżącą godzinę
  currentHourPosition: number = 0; // Obliczona pozycja dla linii
  private intervalId: any;

  consultations$! : Observable<Consultation[]>;

  constructor(private databaseService: DatabaseFireService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['day']) {
      // Zaktualizuj konsultacje, kiedy zmienia się dzień
      this.consultations$ = this.databaseService.getConsultationsForDate(
        new Date(this.day.year, this.day.month - 1, this.day.day)
      );

      // Subskrybuj dane
      this.consultations$.subscribe((consultations) => {
        console.log("Received consultations after day change:", consultations);
      });

      this.setCurrentHour();
    }
  }

  ngOnInit(): void {

    this.consultations$ = this.databaseService.getConsultationsForDate(
      new Date(this.day.year, this.day.month - 1, this.day.day));

    this.consultations$.subscribe((consultations) => {
      console.log("Received consultations:", consultations);
    });

    this.generateTimes();

    this.setCurrentHour();
    if(this.day.isCurrent) {
      // Ustawienie interwału, który będzie aktualizował bieżącą godzinę i pozycję
      this.intervalId = setInterval(() => {
        this.setCurrentHour();
      }, 60000);
    }
  }

  ngOnDestroy(): void {
    // Usunięcie interwału po zniszczeniu komponentu
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  calculateGridRows(consultation: Consultation): [number, number] {
    const midnight = new Date(consultation.startTime);
    midnight.setHours(0, 0, 0, 0);

    const diffStartInMilliseconds = consultation.startTime.getTime() - midnight.getTime();
    const diffEndInMilliseconds = consultation.endTime.getTime() - midnight.getTime();

    const diffStartInMinutes = diffStartInMilliseconds / (1000 * 60);
    const diffEndInMinutes = diffEndInMilliseconds / (1000 * 60);

    const startSlot = Math.floor(diffStartInMinutes / 30) + 1;
    const endSlot = Math.floor(diffEndInMinutes / 30);

    return [startSlot, endSlot];
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
