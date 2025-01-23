import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  SimpleChanges,
  OnChanges,
  ChangeDetectionStrategy,
  AfterViewInit
} from '@angular/core';
import { Day } from '../../../models/day.model';
import { AsyncPipe, NgClass, NgIf, NgStyle } from '@angular/common';
import { DatabaseFireService } from '../../../services/database/fire/database-fire.service';
import { Consultation } from '../../../models/consultation.model';
import { Observable, combineLatest, Subject } from 'rxjs';
import { ConsultationComponent } from '../consultation/consultation.component';
import { UserwithRole } from '../../../models/user.model';
import { AuthFireService } from '../../../services/auth/fire/auth-fire.service';
import { Availability } from '../../../models/availability.model';
import { takeUntil, map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Router} from '@angular/router'; // Dodaj MatSnackBar

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
  styleUrls: ['./day-calendar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DayCalendarComponent implements OnInit, OnDestroy, OnChanges{
  @Input({ required: true }) day!: Day;
  @Input() doctorId: string | undefined | null;

  slots: string[] = [];
  currentHour: string = '';
  currentHourPosition: number = 0;
  private intervalId: any;

  userInfo!: UserwithRole | null;
  consultations$!: Observable<Consultation[]>;
  availabilities$!: Observable<Availability[]> | null;
  absences$!: Observable<Availability[]> | null;

  availableSlots: Set<string> = new Set();
  occupiedSlots: Set<string> = new Set();
  absentSlots: Set<string> = new Set();

  dataLoaded = false; // Flaga wskazująca na załadowanie danych

  private destroy$ = new Subject<void>();

  constructor(
    private databaseService: DatabaseFireService,
    private authService: AuthFireService,
    private snackBar: MatSnackBar, // Iniekcja MatSnackBar
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['day'] && changes['day'].currentValue) {
      console.log('Detected new day:', this.day);
      if (this.userInfo) {
        this.getContent(this.day, this.userInfo);
      }
      this.setCurrentHour();
    }
  }

  ngOnInit(): void {

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.userInfo = user;
        if (this.day) {
          this.getContent(this.day, user);
        }
      });


    this.generateTimes();
    this.setCurrentHour();

    if (this.day.isCurrent) {
      this.intervalId = setInterval(() => {
        this.setCurrentHour();
      }, 60000);
    }
  }




  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  getContent(day: Day, user: UserwithRole | null) {
    if (!user || !day) {
      // Jeśli brak użytkownika lub dnia, wyczyść sloty i zakończ
      this.occupiedSlots.clear();
      this.availableSlots.clear();
      this.absentSlots.clear();
      this.dataLoaded = false;
      return;
    }

    const currentDate = new Date(day.year, day.month - 1, day.day);

    let doctorId: string | null = null;
    let patientId: string | null = null;

    if (user.role === 'doctor') {
      doctorId = user.userId;
    } else if (user.role === 'patient') {
      if (this.doctorId) {
        doctorId = this.doctorId;
      } else {
        patientId = user.userId;
      }
    }

    this.consultations$ = this.databaseService.getConsultationsForDateDoctorAndPatient(currentDate, doctorId, patientId);

    if (doctorId) {
      this.availabilities$ = this.databaseService.getAvailabilitiesForDateAndDoctor(currentDate, doctorId);
      this.absences$ = this.databaseService.getAbsencesForDateAndDoctor(currentDate, doctorId);

      combineLatest([
        this.consultations$,
        this.availabilities$,
        this.absences$
      ]).pipe(takeUntil(this.destroy$))
        .subscribe(([consultations, availabilities, absences]) => {
          this.processAvailabilities(availabilities);
          this.processConsultations(consultations);
          this.processAbsences(absences);
          this.dataLoaded = true; // Ustaw flagę po załadowaniu danych
        });
    } else {
      this.availabilities$ = null;
      this.absences$ = null;

      this.consultations$.pipe(takeUntil(this.destroy$))
        .subscribe(consultations => {
          this.processConsultations(consultations);
          this.availableSlots.clear();
          this.absentSlots.clear();
          this.dataLoaded = true; // Ustaw flagę po załadowaniu danych
        });


    }
  }

  private processAvailabilities(availabilities: Availability[]): void {
    this.availableSlots.clear();
    availabilities.forEach(availability => {
      const start = this.formatTime(availability.startTime);
      const end = this.formatTime(availability.endTime);
      this.addSlotsInRange(start, end, this.availableSlots);
    });
  }

  private processConsultations(consultations: Consultation[]): void {
    this.occupiedSlots.clear();
    consultations.forEach(consultation => {
      const start = this.formatTime(consultation.startTime);
      const end = this.formatTime(consultation.endTime);
      this.addSlotsInRange(start, end, this.occupiedSlots);
    });
  }

  private processAbsences(absences: Availability[]): void {
    this.absentSlots.clear();
    absences.forEach(absence => {
      const start = this.formatTime(absence.startTime);
      const end = this.formatTime(absence.endTime);
      this.addSlotsInRange(start, end, this.absentSlots);
    });
  }

  private addSlotsInRange(start: string, end: string, slotSet: Set<string>): void {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    let current = new Date(0, 0, 0, startHour, startMinute);

    const endDate = new Date(0, 0, 0, endHour, endMinute);

    while (current < endDate) {
      const hour = current.getHours().toString().padStart(2, '0');
      const minute = current.getMinutes().toString().padStart(2, '0');
      slotSet.add(`${hour}:${minute}`);
      current.setMinutes(current.getMinutes() + 30);
    }
  }

  isSlotAvailable(slot: string): boolean {
    return this.availableSlots.has(slot);
  }

  isSlotOccupied(slot: string): boolean {
    return this.occupiedSlots.has(slot);
  }

  isSlotAbsent(slot: string): boolean {
    return this.absentSlots.has(slot);
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  bookConsultation(slot: string): void {
    if (
      this.userInfo?.role === 'patient' &&
      this.availableSlots.has(slot) &&
      !this.absentSlots.has(slot) &&
      !this.occupiedSlots.has(slot)
    ) {
      console.log(`Rezerwacja konsultacji na godzinę: ${slot}`);
      this.openBookingModal(slot);
    } else {
      console.log(`Slot ${slot} jest już zajęty lub niedostępny.`);
    }
  }

  openBookingModal(slot: string) {
    if (this.doctorId && this.day) {
      const formattedDate = this.formatTimeForURL(slot);
      this.router.navigate([`/doctors/${this.doctorId}/newconsultation`], {
        queryParams: { startTime: formattedDate }
      });
    } else {
      console.log('Brak ID lekarza!');
    }
  }

// Funkcja pomocnicza do formatowania daty
  private formatTimeForURL(slot: string): string {
    if (!this.day) {
      throw new Error('Day is not set');
    }
    const { year, month, day } = this.day;
    const date = new Date(year, month - 1, day); // Miesiące w JavaScript są indeksowane od 0
    const [hours, minutes] = slot.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
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

    const positionInPixels = currentHour * 102 + currentMinute * 2;

    this.currentHour = currentHourStr;
    this.currentHourPosition = positionInPixels;
  }
}
