import {inject, Injectable, signal} from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  updateProfile,
  user
} from '@angular/fire/auth';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {DatabaseFireService} from '../../database/fire/database-fire.service';
import {Doctor} from '../../../models/doctor.model';
import {Patient} from '../../../models/patient.model';
import {UserwithRole} from '../../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthFireService {
  firebaseAuth = inject(Auth);
  storeService = inject(DatabaseFireService);

  user$ = user(this.firebaseAuth);

  private currentUserSubject: BehaviorSubject<UserwithRole | null> = new BehaviorSubject<UserwithRole | null>(null);
  currentUser$: Observable<UserwithRole | null> = this.currentUserSubject.asObservable();

  subscribe() {
    // Subskrybuj zmiany w użytkowniku i aktualizuj currentUserSubject
    this.user$.subscribe((firebaseUser) => {
      if (firebaseUser) {
        // Jeśli użytkownik jest zalogowany, pobierz dane użytkownika z bazy
        this.storeService.getUser(firebaseUser.uid).subscribe((userData) => {
          if (userData) {
            this.currentUserSubject.next(userData);
          }
        });
      } else {
        // Jeśli użytkownik nie jest zalogowany, ustaw null
        this.currentUserSubject.next(null);
      }
    });
  }

  register(
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string,
    role: 'doctor' | 'patient',
    specialization?: string // Tylko dla lekarzy
  ): Observable<void> {

    if (!email || !password || !username) {
      console.error('Email, password or username is missing.');
      console.log(email);
      console.log(password);
      console.log(username);
    }

    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then((response) => {
      const userId = response.user.uid;
      const userData: UserwithRole = {
        email,
        username,
        role,
      };

      this.storeService.addUser(userId, userData);

      // Dodaj szczegółowe dane w zależności od roli
      if (role === 'doctor') {
        const doctorData: Doctor = {
          firstName,
          lastName,
          specialization: specialization || '',
          availabilities: [],
          absences: [],
        };
        this.storeService.addDoctor(userId, doctorData);
      } else if (role === 'patient') {
        const patientData: Patient = {
          firstName,
          lastName,
        };
        this.storeService.addPatient(userId, patientData);
      }
    });

    return from(promise);
  }


  login(
    email: string,
    password: string
  ) : Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then((response) => {});
    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth)
      .then(() => {
        console.log("user set to null");
        console.log(this.user$);
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
    return from(promise);
  }
}
