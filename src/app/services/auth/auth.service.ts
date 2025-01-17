import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {from, Observable} from 'rxjs';
import { User } from '@firebase/auth-types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) {}

  login(email: string, password: string): Observable<any> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password));
  }

  register(email: string, password: string): Observable<any> {
    return from(this.afAuth.createUserWithEmailAndPassword(email, password));
  }

  logout(): Observable<void> {
    return from(this.afAuth.signOut());
  }

  get currentUser(): Observable<User | null> {
    return from(this.afAuth.authState);
  }
}
