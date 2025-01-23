import {inject, Injectable, signal} from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut,
  updateProfile,
  user
} from '@angular/fire/auth';
import {BehaviorSubject, catchError, from, Observable, of, tap, throwError} from 'rxjs';
import {DatabaseFireService} from '../../database/fire/database-fire.service';
import {Doctor} from '../../../models/doctor.model';
import {Patient} from '../../../models/patient.model';
import {UserwithRole} from '../../../models/user.model';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthFireService  {
  firebaseAuth = inject(Auth);
  storeService = inject(DatabaseFireService);

  user$ = user(this.firebaseAuth);

  private currentUserSubject: BehaviorSubject<UserwithRole | null> = new BehaviorSubject<UserwithRole | null>(null);
  currentUser$: Observable<UserwithRole | null> = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeUserSubscription();
  }


  private initializeUserSubscription() {
    this.user$.subscribe({
      next: (firebaseUser) => {
        console.log('Auth State Changed:', firebaseUser);
        if (firebaseUser != null) {
          this.storeService.getUser(firebaseUser.uid).subscribe({
            next: (userData) => {
              console.log('Fetched User Data:', userData);
              this.currentUserSubject.next(userData);
            },
            error: (error) => {
              console.error('Error fetching user data:', error);
              this.currentUserSubject.next(null);
            }
          });
        } else {
          console.log('User is logged out.');
          this.currentUserSubject.next(null);
        }
      },
      error: (error) => {
        console.error('Error with user subscription:', error);
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
        userId,
        email,
        username,
        role,
      };

      this.storeService.addUser(userId, userData);

      // Dodaj szczegółowe dane w zależności od roli
      if (role === 'doctor') {
        const doctorData: Doctor = {
          userId,
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
    // Clear user state immediately to avoid stale data being used
    this.currentUserSubject.next(null);

    return from(signOut(this.firebaseAuth)).pipe(
      tap(() => {
        console.log("User is now logged out");
      }),
      catchError((error) => {
        console.error('Logout failed:', error);
        return throwError(error);
      })
    );
  }

  hasRole(expectedRole: 'doctor' | 'patient'): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => {
        if (!user) {
          return false;
        }
        return user.role === expectedRole;
      }),
      catchError(() => of(false))
    );
  }


}
