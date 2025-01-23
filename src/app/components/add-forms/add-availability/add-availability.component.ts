import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { Availability } from '../../../models/availability.model';
import { DatabaseFireService } from '../../../services/database/fire/database-fire.service';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {firstValueFrom, Observable} from 'rxjs';
import {UserwithRole} from '../../../models/user.model';
import {AuthFireService} from '../../../services/auth/fire/auth-fire.service';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-add-availability',
  templateUrl: './add-availability.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    ReactiveFormsModule
  ],
  styleUrls: ['./add-availability.component.css']
})
export class AddAvailabilityComponent implements OnInit{
  form!: FormGroup;
  weekDays = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

  currentUser: UserwithRole | null = null;

  constructor(private fb: FormBuilder, private authService: AuthFireService, public dialog: MatDialog, private databaseService: DatabaseFireService) {}

  ngOnInit() {
    this.form = this.fb.group({
      availabilityType: ['jednorazowa', Validators.required],
      startDate: [''],
      endDate: [''],
      startTime: [''],
      endTime: [''],
      singleDate: [''],
      singleStartTime: [''],
      singleEndTime: [''],
      selectedDays: [[]],
    }, { validators: [this.dateValidation] });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }



  toggleDaySelection(day: string) {
    const selectedDays = this.form.value.selectedDays || [];
    if (selectedDays.includes(day)) {
      this.form.patchValue({ selectedDays: selectedDays.filter((d: string) => d !== day) });
    } else {
      this.form.patchValue({ selectedDays: [...selectedDays, day] });
    }
  }

  dateValidation(group: FormGroup) {
    const now = new Date();
    const startDate = new Date(group.get('startDate')?.value);
    const endDate = new Date(group.get('endDate')?.value);
    const singleDate = new Date(group.get('singleDate')?.value);

    if (group.get('availabilityType')?.value === 'cykliczna') {
      if (startDate && startDate < now) {
        return { startDateInPast: true };
      }
      if (endDate && endDate < now) {
        return { endDateInPast: true };
      }
      if (startDate && endDate && startDate > endDate) {
        return { dateRangeInvalid: true };
      }
    }

    if (group.get('availabilityType')?.value === 'jednorazowa') {
      if (singleDate && singleDate < now) {
        return { singleDateInPast: true };
      }
      const singleStartTime = group.get('singleStartTime')?.value;
      const singleEndTime = group.get('singleEndTime')?.value;
      if (singleStartTime && singleEndTime && singleStartTime >= singleEndTime) {
        return { dateRangeInvalid: true };
      }
    }

    return null;
  }

  onSubmit() {
    if (this.form.valid) {
      const availabilityType = this.form.value.availabilityType;

      const availabilities: Availability[] = []

      if (availabilityType === 'jednorazowa') {
        const startDateTime = new Date(`${this.form.value.singleDate}T${this.form.value.singleStartTime}`);
        const endDateTime = new Date(`${this.form.value.singleDate}T${this.form.value.singleEndTime}`);


        availabilities.push({
          startTime: startDateTime,
          endTime: endDateTime
        });

      } else if (availabilityType === 'cykliczna') {
        const startDate = new Date(this.form.value.startDate);
        const endDate = new Date(this.form.value.endDate);
        const selectedDays: string[] = this.form.value.selectedDays; // Lista wybranych dni tygodnia

        const dayMap: { [key: string]: number } = {
          'Poniedziałek': 1,
          'Wtorek': 2,
          'Środa': 3,
          'Czwartek': 4,
          'Piątek': 5,
          'Sobota': 6,
          'Niedziela': 0
        };

// Przechodzimy przez wszystkie dni w zakresie dat
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const currentDayOfWeek = currentDate.getDay(); // Pobranie dnia tygodnia (0 = niedziela, 1 = poniedziałek, ..., 6 = sobota)

          // Sprawdzenie, czy aktualny dzień tygodnia pasuje do wybranych przez użytkownika dni
          if (selectedDays.some(day => dayMap[day] === currentDayOfWeek)) {
            const startDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${this.form.value.startTime}`);
            const endDateTime = new Date(`${currentDate.toISOString().split('T')[0]}T${this.form.value.endTime}`);

            availabilities.push({
              startTime: startDateTime,
              endTime: endDateTime
            });
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }
      }


      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {message: 'Czy na pewno chcesz dodać tę dostępność?'}
      });


      dialogRef.afterClosed().subscribe(async (result) => {
        if (result === 'yes') {
          if(this.currentUser?.userId){
            await this.databaseService.addDoctorAvailabilities(this.currentUser.userId, availabilities)
              .then(() => alert('Dostępność została dodana'))
              .catch((error) => console.error('Błąd podczas dodawania dostępności:', error));
          }
          this.form.reset({availabilityType: 'jednorazowa'});
        } else {
          console.log('Dodanie anulowane');
        }

      })
    }
  }
}
