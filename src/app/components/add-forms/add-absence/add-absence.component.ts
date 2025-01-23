import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFireService } from '../../../services/auth/fire/auth-fire.service';
import { Router } from '@angular/router';
import { DatabaseFireService } from '../../../services/database/fire/database-fire.service';
import { NgIf } from '@angular/common';
import { UserwithRole } from '../../../models/user.model';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-absence',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './add-absence.component.html',
  standalone: true,
  styleUrl: './add-absence.component.css'
})
export class AddAbsenceComponent implements OnInit {

  form!: FormGroup;
  userInfo!: UserwithRole | null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthFireService,
    private databaseService: DatabaseFireService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.form = this.fb.group(
      {
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
      },
      { validators: this.dateRangeValidator }
    );

    this.authService.currentUser$.subscribe(user => {
      this.userInfo = user;
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      const startDate = new Date(this.form.value.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(this.form.value.endDate);
      endDate.setHours(23, 59, 59, 999);

      const id = this.userInfo?.userId;
      if (id) {
        const consultation = await this.databaseService.isConsultationAtTime(startDate, id);

        if (consultation) {
          // Jeśli istnieje konsultacja, pokaż okno potwierdzenia
          const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '400px',
            data: { message: 'There is already a consultation at this time. Do you want to cancel it and add the absence?' },
          });

          dialogRef.afterClosed().subscribe(async (result) => {
            if (result === 'yes') {
              await this.handleAbsences(id, startDate, endDate);
            }
          });
        } else {
          // Jeśli nie ma konsultacji, dodaj absencję bez potwierdzenia
          await this.handleAbsences(id, startDate, endDate);
        }
      }
    }
  }

  async handleAbsences(doctorId: string, startDate: Date, endDate: Date) {
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const absence = {
        startTime: new Date(currentDate),
        endTime: new Date(currentDate.setHours(23, 59, 59, 999))
      };

      await this.databaseService.addDoctorAbsence(doctorId, absence);

      // Przejdź do następnego dnia
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    // Pokaż komunikat o powodzeniu
    this.snackBar.open('Absence successfully added!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });

    // Przekierowanie po dodaniu absencji
    this.router.navigate(['/mycalendar']);
  }

  dateRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const startDate = control.get('startDate')?.value;
    const endDate = control.get('endDate')?.value;
    const today = new Date().setHours(0, 0, 0, 0);

    if (startDate && new Date(startDate).getTime() < today) {
      return { startDateInPast: true };
    }

    if (endDate && new Date(endDate).getTime() < today) {
      return { endDateInPast: true };
    }

    if (startDate && endDate && new Date(startDate).getTime() > new Date(endDate).getTime()) {
      return { dateRangeInvalid: true };
    }

    return null;
  }
}
