import {Component, Input, OnInit} from '@angular/core';
import {Doctor} from '../../../models/doctor.model';
import {Observable} from 'rxjs';
import {UserwithRole} from '../../../models/user.model';
import {AuthService} from '../../../services/auth/auth.service';
import {AuthFireService} from '../../../services/auth/fire/auth-fire.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-doctor-element',
  imports: [],
  templateUrl: './doctor-element.component.html',
  standalone: true,
  styleUrl: './doctor-element.component.css'
})
export class DoctorElementComponent implements OnInit{
  @Input({required: true}) doctor!: Doctor;

  currentUser$!: Observable<UserwithRole | null>;

  constructor(private authService: AuthFireService, private router: Router) {}

  ngOnInit():void {
    this.currentUser$ = this.authService.currentUser$;
  }

  navigateToCalendar(): void {
    this.currentUser$.subscribe(user => {
      if (user && user.role === 'patient') {
        this.router.navigate([`/doctors/${this.doctor.userId}`]);
      }
    });
  }
}
