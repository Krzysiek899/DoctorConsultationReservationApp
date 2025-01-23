import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Consultation, ConsultationType } from '../../../models/consultation.model';
import { AuthFireService } from '../../../services/auth/fire/auth-fire.service';
import { DatabaseFireService } from '../../../services/database/fire/database-fire.service';
import { Router } from '@angular/router';
import { UserwithRole } from '../../../models/user.model';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {AsyncPipe, NgForOf} from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import {CartService} from '../../../services/cart/cart.service';

@Component({
  selector: 'app-add-consultation',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    AsyncPipe
  ],
  templateUrl: './add-consultation.component.html',
  standalone: true,
  styleUrls: ['./add-consultation.component.css']
})
export class AddConsultationComponent implements OnInit {

  doctorId!: string | null;
  startTime!: Date;

  form!: FormGroup;
  currentUser!: UserwithRole | null;

  availableSlots: string[] = [];
  occupiedSlots: string[] = [];
  maxConsultationLength: number = 180; // 3 godziny = 180 minut

  private lengthOptionsSubject = new BehaviorSubject<number[]>([]);
  lengthOptions$: Observable<number[]> = this.lengthOptionsSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private authService: AuthFireService,
    private router: Router,
    private databaseService: DatabaseFireService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.doctorId = params.get('doctorId');
    });

    this.route.queryParamMap.subscribe(queryParams => {
      this.startTime = new Date(queryParams.get('startTime')!);
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.form = this.fb.group({
      length: [30, [Validators.required]], // Domyślna długość to 30 minut
      type: [null, [Validators.required]],
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      sex: [null, [Validators.required]],
      age: ["", [Validators.required, Validators.min(0)]],
      info: [""],
    });

    this.fetchAvailabilityAndConsultations();
  }

  fetchAvailabilityAndConsultations() {
    if(this.doctorId){
      this.databaseService.getAvailabilitiesForDateAndDoctor(this.startTime, this.doctorId)
        .subscribe(availabilities => {
          console.log(availabilities);
          this.processAvailabilities(availabilities);

          this.databaseService.getConsultationsForDateDoctorAndPatient(this.startTime, this.doctorId, null)
            .subscribe(consultations => {
              console.log(consultations);
              this.processConsultations(consultations);
              this.updateLengthOptions();
            });
        });
    }

  }

  processAvailabilities(availabilities: any[]) {
    this.availableSlots = availabilities.map(availability => {
      return this.getTimeSlotsBetween(availability.startTime, availability.endTime);
    }).flat();
  }

  processConsultations(consultations: Consultation[]) {
    this.occupiedSlots = consultations.map(consultation => {
      return this.getTimeSlotsBetween(consultation.startTime, consultation.endTime);
    }).flat();
  }

  getTimeSlotsBetween(start: Date, end: Date): string[] {
    const slots: string[] = [];
    let current = new Date(start);
    const endTime = new Date(end);

    while (current < endTime) {
      slots.push(this.formatTime(current));
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  }

  updateLengthOptions() {
    const formattedStartTime = this.formatTime(this.startTime);
    let availableTime = 0;

    for (const slot of this.availableSlots) {
      if (slot === formattedStartTime || availableTime > 0) {
        if (this.occupiedSlots.includes(slot)) {
          break; // Zatrzymaj liczenie, jeśli slot jest zajęty
        }
        availableTime += 30;
      }
    }

    const maxDuration = Math.min(availableTime, this.maxConsultationLength);
    const lengthOptions: number[] = [];

    for (let i = 30; i <= maxDuration; i += 30) {
      lengthOptions.push(i);
    }

    this.lengthOptionsSubject.next(lengthOptions);
    this.form.controls['length'].setValue(lengthOptions.length > 0 ? lengthOptions[0] : null);
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onSubmit() {
    if(this.doctorId){

      if (this.form.valid) {
        const consultationLength = this.form.value.length;
        const endTime = new Date(this.startTime);
        endTime.setMinutes(endTime.getMinutes() + consultationLength);

        // // Sprawdzenie czy rezerwacja koliduje z zajętymi slotami
        // const requestedSlots = this.getTimeSlotsBetween(this.startTime, endTime);
        // const isOverlap = requestedSlots.some(slot => this.occupiedSlots.includes(slot));
        //
        // if (isOverlap) {
        //   this.snackBar.open('Wybrana długość konsultacji koliduje z innymi rezerwacjami.', 'Zamknij', { duration: 3000 });
        //   return;
        // }

        const consultation: Consultation = {
          doctorId: this.doctorId,
          patientId: this.currentUser?.userId || '',
          startTime: this.startTime,
          endTime: endTime,
          firstName: this.form.value.firstName,
          lastName: this.form.value.lastName,
          type: this.form.value.type,
          sex: this.form.value.sex,
          age: this.form.value.age,
          info: this.form.value.info,
          status: 'ok', // Nowa konsultacja domyślnie jako "ok"
        };

          this.cartService.addToCart(consultation);
          this.snackBar.open('Konsultacja została pomyślnie dodana!', 'OK', { duration: 3000 });
          this.router.navigate(['/cart']);
      }
    }
  }

  protected readonly Object = Object;
  protected readonly ConsultationType = ConsultationType;



  formatDateString(dateString: string): string {
      const date = new Date(dateString);

      const months = [
        "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
        "lipca", "sierpnia", "września", "października", "listopada", "grudnia"
      ];

      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day} ${month} ${year} ${hours}:${minutes}`;
    }

}
