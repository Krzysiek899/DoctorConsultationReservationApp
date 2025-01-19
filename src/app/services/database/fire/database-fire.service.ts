import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {Doctor} from '../../../models/doctor.model';
import {collection, collectionData, Firestore, getDocs, query, where} from '@angular/fire/firestore';
import {Consultation} from '../../../models/consultation.model';

;

@Injectable({
  providedIn: 'root'
})
export class DatabaseFireService {

  store = inject(Firestore)

  doctorsCollection = collection(this.store, 'doctors');
  consultationsCollection = collection(this.store, 'consultations');


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
