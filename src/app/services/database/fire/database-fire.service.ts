import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {Doctor} from '../../../models/doctor.model';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDocs,
  query,
  setDoc,
  where
} from '@angular/fire/firestore';
import {Consultation} from '../../../models/consultation.model';
import {UserwithRole} from '../../../models/user.model';
import {Patient} from '../../../models/patient.model';

;

@Injectable({
  providedIn: 'root'
})
export class DatabaseFireService {

  store = inject(Firestore);

  doctorsCollection = collection(this.store, 'doctors');
  consultationsCollection = collection(this.store, 'consultations');

  addUser(userId: string, userData: UserwithRole): Promise<void> {
    const userRef = doc(this.store, `users/${userId}`);
    return setDoc(userRef, userData);
  }

  // Dodaj lekarza do `doctors`
  addDoctor(doctorId: string, doctorData: Doctor): Promise<void> {
    const doctorRef = doc(this.store, `doctors/${doctorId}`);
    return setDoc(doctorRef, doctorData);
  }

  // Dodaj pacjenta do `patients`
  addPatient(patientId: string, patientData: Patient): Promise<void> {
    const patientRef = doc(this.store, `patients/${patientId}`);
    return setDoc(patientRef, patientData);
  }

  // Pobierz dane użytkownika z `users`
  getUser(userId: string): Observable<UserwithRole> {
    const userRef = doc(this.store, `users/${userId}`);
    return docData(userRef) as Observable<UserwithRole>;
  }

  // Pobierz dane lekarza z `doctors`
  getDoctor(doctorId: string): Observable<Doctor> {
    const doctorRef = doc(this.store, `doctors/${doctorId}`);
    return docData(doctorRef) as Observable<Doctor>;
  }

  // Pobierz dane pacjenta z `patients`
  getPatient(patientId: string): Observable<Patient> {
    const patientRef = doc(this.store, `patients/${patientId}`);
    return docData(patientRef) as Observable<Patient>;
  }


  getDoctors(): Observable<Doctor[]> {
    return collectionData(this.doctorsCollection, {
      idField: 'id',
    }) as Observable<Doctor[]>;
  }

  getConsultations(): Observable<Consultation[]> {
    console.log("Got request for consultations");
    return collectionData(this.consultationsCollection, {
      idField: 'id',
    }).pipe(
      map((consultations: any[]) => consultations.map((consultation: any) => ({
        ...consultation,
        startTime: consultation.startTime.toDate(),
        endTime: consultation.endTime.toDate()
      })))
    ) as Observable<Consultation[]>;
  }

  getConsultationsForDate(targetDate: Date): Observable<Consultation[]> {
    console.log("Getting consultations for target date:", targetDate);

    // Wyzerowanie godzin w targetDate, żeby porównać tylko daty
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0); // początek dnia (00:00:00)

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999); // koniec dnia (23:59:59)

    console.log("Start of day:", startOfDay);
    console.log("End of day:", endOfDay);

    // Pobieranie konsultacji z Firestore
    return collectionData(this.consultationsCollection, {
      idField: 'id',
    }).pipe(
      map((consultations: any[]) => {
        console.log("Raw consultations from Firestore:", consultations);

        const consultationsWithDates = consultations.map((consultation: any) => ({
          ...consultation,
          startTime: consultation.startTime.toDate(), // Konwertowanie na obiekt Date
          endTime: consultation.endTime.toDate() // Konwertowanie na obiekt Date
        }));

        console.log("Consultations after mapping to Date:", consultationsWithDates);

        return consultationsWithDates.filter((consultation: Consultation) => {
          console.log("Consultation start time:", consultation.startTime);
          const isInDateRange = consultation.startTime >= startOfDay && consultation.startTime <= endOfDay;
          console.log("Is in range?", isInDateRange);
          return isInDateRange;
        });
      })
    ) as Observable<Consultation[]>;
  }

  async isConsultationAtTime(date: Date): Promise<Consultation | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0); // Początek dnia

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999); // Koniec dnia

    const consultationsRef = collection(this.store, 'consultations');
    const q = query(
      consultationsRef,
      where('startTime', '<=', endOfDay), // startTime przed końcem dnia
      where('endTime', '>=', startOfDay)  // endTime po początku dnia
    );

    try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as Consultation;
      } else {
        return null;
      }
    } catch (e) {
      console.error('Error getting documents: ', e);
      return null;
    }
  }


}
