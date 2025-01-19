import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {BehaviorSubject, from, map, Observable, switchMap} from 'rxjs';
import {Firestore} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private userRoleSubject = new BehaviorSubject<string | null>(null); // Role użytkownika
  // userRole$ = this.userRoleSubject.asObservable(); // Observable do obserwacji roli użytkownika
  //
  // isLoggedIn$: Observable<boolean>; // Status logowania
  //
  // constructor(
  //   private afAuth: AngularFireAuth,
  //   private firestore: Firestore
  // ) {
  //   // Obserwuj stan logowania
  //   this.isLoggedIn$ = this.afAuth.authState.pipe(
  //     map(user => !!user)
  //   );
  //
  //   // Pobierz role użytkownika przy zmianie stanu logowania
  //   this.afAuth.authState
  //     .pipe(
  //       switchMap(user => {
  //         if (user) {
  //           return this.getUserRole(user.uid); // Pobierz rolę na podstawie UID
  //         } else {
  //           return [null]; // Brak użytkownika = brak roli
  //         }
  //       })
  //     )
  //     .subscribe(role => this.userRoleSubject.next(role));
  // }
  //
  // // Rejestracja użytkownika
  // async register(email: string, password: string, role: string): Promise<void> {
  //   const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
  //   const userId = credential.user?.uid;
  //
  //   if (userId) {
  //     // Dodaj użytkownika do Firestore z przypisaną rolą
  //     await this.firestore.collection('users').doc(userId).set({
  //       email,
  //       role
  //     });
  //   }
  // }
  //
  // // Logowanie
  // async login(email: string, password: string): Promise<void> {
  //   await this.afAuth.signInWithEmailAndPassword(email, password);
  // }
  //
  // // Wylogowanie
  // async logout(): Promise<void> {
  //   try {
  //     await this.afAuth.signOut();
  //     this.userRoleSubject.next(null); // Zresetuj rolę
  //   } catch (error) {
  //     console.error("Logout failed", error);
  //   }
  // }
  //
  // // Pobierz rolę użytkownika z Firestore
  // private getUserRole(userId: string): Observable<string | null> {
  //   return this.firestore
  //     .collection('users')
  //     .doc(userId)
  //     .valueChanges()
  //     .pipe(
  //       map((user: any) => user?.role || null) // Pobierz rolę lub null
  //     );
  // }
}
