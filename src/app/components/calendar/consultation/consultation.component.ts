import {Component, Input, OnInit} from '@angular/core';
import { Consultation } from '../../../models/consultation.model';
import { NgClass, NgStyle } from '@angular/common';
import { AuthFireService } from '../../../services/auth/fire/auth-fire.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ConfirmationDialogComponent} from '../../add-forms/confirmation-dialog/confirmation-dialog.component';
import {DatabaseFireService} from '../../../services/database/fire/database-fire.service';

@Component({
  selector: 'app-consultation',
  imports: [
    NgStyle,
    NgClass,
    MatDialogModule
  ],
  templateUrl: './consultation.component.html',
  standalone: true,
  styleUrl: './consultation.component.css'
})
export class ConsultationComponent implements OnInit {
  @Input({ required: true }) consultation!: Consultation;

  showDetails: boolean = false;
  userRole: string | null = null;
  userId: string | null = null;

  constructor(
    private authService: AuthFireService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private dbService: DatabaseFireService,
  ) {}


  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userRole = user.role;
        this.userId = user.userId;
      }
    });
  }

  getClass(): string {
    return this.consultation.endTime < new Date() ? "past" : this.consultation.type;
  }

  canCancel(): boolean {
    return this.userRole === 'patient' && this.userId === this.consultation.patientId;
  }


  cancelReservation(): void {
    if (this.canCancel()) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '350px',
        data: {
          title: 'Potwierdzenie anulowania',
          message: `Czy na pewno chcesz anulować rezerwację dla ${this.consultation.firstName} ${this.consultation.lastName}?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          console.log(`Odwołano rezerwację dla ${this.consultation.firstName} ${this.consultation.lastName}`);
          this.snackBar.open('Rezerwacja została odwołana.', 'Zamknij', { duration: 3000 });

          if(this.consultation.id){
            this.dbService.deleteConsultation(this.consultation.id);
          }

        } else {
          console.log('Anulowanie odwołane.');
        }
      });

    } else {
      this.snackBar.open('Nie masz uprawnień do anulowania tej rezerwacji.', 'Zamknij', { duration: 3000 });
    }
  }

}
