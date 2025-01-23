import {inject, Injectable} from '@angular/core';
import {from, map, Observable, switchMap} from 'rxjs';
import {Doctor} from '../../../models/doctor.model';
import {
  collection,
  collectionData,
  doc,
  docData,
  Firestore,
  getDocs,
  query,
  setDoc, updateDoc,
  where,
  arrayUnion, writeBatch, addDoc, deleteDoc
} from '@angular/fire/firestore';
import {Consultation} from '../../../models/consultation.model';
import {UserwithRole} from '../../../models/user.model';
import {Patient} from '../../../models/patient.model';
import {Availability} from '../../../models/availability.model';
import { Timestamp } from 'firebase/firestore';  // Importowanie Timestamp


@Injectable({
  providedIn: 'root'
})
export class DatabaseFireService {

  store = inject(Firestore);

  //users
  addUser(userId: string, userData: UserwithRole): Promise<void> {
    const userRef = doc(this.store, `users/${userId}`);
    return setDoc(userRef, userData);
  }

  addDoctor(doctorId: string, doctorData: Doctor): Promise<void> {
    const doctorRef = doc(this.store, `doctors/${doctorId}`);
    return setDoc(doctorRef, doctorData);
  }

  addPatient(patientId: string, patientData: Patient): Promise<void> {
    const patientRef = doc(this.store, `patients/${patientId}`);
    return setDoc(patientRef, patientData);
  }

  getUser(userId: string): Observable<UserwithRole> {
    const userRef = doc(this.store, `users/${userId}`);
    return docData(userRef) as Observable<UserwithRole>;
  }

  getDoctor(doctorId: string): Observable<Doctor> {
    const doctorRef = doc(this.store, `doctors/${doctorId}`);
    return docData(doctorRef) as Observable<Doctor>;
  }

  getPatient(patientId: string): Observable<Patient> {
    const patientRef = doc(this.store, `patients/${patientId}`);
    return docData(patientRef) as Observable<Patient>;
  }

  //doctorList
  getDoctors(): Observable<Doctor[]> {
    return collectionData(collection(this.store, 'doctors'), {
      idField: 'id',
    }) as Observable<Doctor[]>;
  }



  async addDoctorAvailabilities(doctorId: string, availabilities: Availability[]): Promise<void> {
    const availabilitiesRef = collection(this.store, `doctors/${doctorId}/availabilities`);
    const promises = availabilities.map(availability => addDoc(availabilitiesRef, availability));

    await Promise.all(promises);
    console.log('Dostępność została dodana');
  }


  async addDoctorAbsence(doctorId: string, absence: Availability): Promise<void> {
    const absencesRef = collection(this.store, `doctors/${doctorId}/absences`);
    try {
      const docRef = await addDoc(absencesRef, absence);
      console.log(`Added absence with ID: ${docRef.id}`);
    } catch (err) {
      console.error('Error adding absence:', err);
    }
  }


  getDoctorAbsences(doctorId: string): Observable<Availability[]> {
    const absencesRef = collection(this.store, `doctors/${doctorId}/absences`);
    return collectionData(absencesRef, { idField: 'id' }) as Observable<Availability[]>;
  }

  isThisDayAbsence(doctorId: string, date: Date): Observable<boolean> {
    console.log('Funkcja isThisDayAbsence została wywołana dla:', doctorId, date);

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const startOfDayTimestamp = Timestamp.fromDate(startOfDay);
    const endOfDayTimestamp = Timestamp.fromDate(endOfDay);



    // Zapytanie do kolekcji w Firestore
    const absencesRef = collection(this.store, `doctors/${doctorId}/absences`);

    const q = query(
      absencesRef,
      where('startDate', '<=', endOfDayTimestamp),  // Początek absencji przed końcem dnia
      where('endDate', '>=', startOfDayTimestamp)   // Koniec absencji po początku dnia
    );

    return new Observable<boolean>((observer) => {
      getDocs(q)
        .then((querySnapshot) => {
          observer.next(!querySnapshot.empty);
          observer.complete();
        })
        .catch((err) => {
          console.error('Błąd pobierania dokumentów: ', err);
          observer.error(false);
        });
    });
  }

  getAvailabilitiesForDateAndDoctor(targetDate: Date, doctorId: string): Observable<Availability[]> {
    console.log("Getting availabilities for target date:", targetDate, "and doctor ID:", doctorId);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return collectionData(collection(this.store, `doctors/${doctorId}/availabilities`), {
      idField: 'id',
    }).pipe(
      map((availabilities: any[]) => availabilities
        .map((availability: any) => ({
          ...availability,
          startTime: availability.startTime.toDate(),
          endTime: availability.endTime.toDate()
        }))
        .filter((availability: Availability) =>
          availability.startTime >= startOfDay && availability.startTime <= endOfDay
        )
      )
    ) as Observable<Availability[]>;
  }

  getAbsencesForDateAndDoctor(targetDate: Date, doctorId: string): Observable<Availability[]> {
    console.log("Getting absences for target date:", targetDate, "and doctor ID:", doctorId);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return collectionData(collection(this.store, `doctors/${doctorId}/absences`), {
      idField: 'id',
    }).pipe(
      map((absences: any[]) => absences
        .map((absence: any) => ({
          ...absence,
          startTime: absence.startTime.toDate(),
          endTime: absence.endTime.toDate()
        }))
        .filter((absence: Availability) =>
          absence.startTime >= startOfDay && absence.startTime <= endOfDay
        )
      )
    ) as Observable<Availability[]>;
  }

  async addConsultation(consultation: Consultation): Promise<void> {
    try {
      // Przygotowanie danych do zapisu bez ID
      const consultationData = {
        ...consultation,
        startTime: Timestamp.fromDate(consultation.startTime),
        endTime: Timestamp.fromDate(consultation.endTime)
      };

      // Dodanie dokumentu do kolekcji 'consultations' i pobranie jego ID
      const docRef = await addDoc(collection(this.store, 'consultations'), consultationData);

      // Zapis ID dokumentu wewnątrz obiektu konsultacji
      await setDoc(doc(this.store, 'consultations', docRef.id), {
        ...consultationData,
        id: docRef.id
      });

      console.log(`Konsultacja została dodana z ID: ${docRef.id}`, consultation);
    } catch (error) {
      console.error('Błąd podczas dodawania konsultacji:', error);
      throw error;
    }
  }

  async deleteConsultation(consultationId: string): Promise<void> {
    try {
      // Odwołanie do dokumentu w kolekcji 'consultations'
      const consultationRef = doc(this.store, 'consultations', consultationId);

      // Usunięcie dokumentu
      await deleteDoc(consultationRef);

      console.log(`Konsultacja o ID: ${consultationId} została usunięta.`);
    } catch (error) {
      console.error("Błąd podczas usuwania konsultacji:", error);
      throw error;
    }
  }



  getConsultations(): Observable<Consultation[]> {
    console.log("Got request for consultations");
    return collectionData(collection(this.store, 'consultations'), {
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
    return collectionData(collection(this.store, 'consultations'), {
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

  getConsultationsForDateDoctorAndPatient(
    targetDate: Date,
    doctorId: string | null,
    patientId: string | null
  ): Observable<Consultation[]> {
    console.log(
      "Getting consultations for target date:",
      targetDate,
      "doctor ID:",
      doctorId,
      "patient ID:",
      patientId
    );

    // Ustalenie początku i końca dnia
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // console.log("Start of day:", startOfDay);
    // console.log("End of day:", endOfDay);

    // Pobieranie konsultacji z Firestore
    return collectionData(collection(this.store, 'consultations'), {
      idField: 'id',
    }).pipe(
      map((consultations: any[]) => {
        //console.log("Raw consultations from Firestore:", consultations);

        // Mapowanie startTime i endTime na obiekty Date
        const consultationsWithDates = consultations.map((consultation: any) => ({
          ...consultation,
          startTime: consultation.startTime.toDate(), // Konwersja na Date
          endTime: consultation.endTime.toDate()     // Konwersja na Date
        }));

        //console.log("Consultations after mapping to Date:", consultationsWithDates);

        // Filtrowanie konsultacji na podstawie podanych kryteriów
        return consultationsWithDates.filter((consultation: Consultation) => {
          //console.log("Consultation start time:", consultation.startTime);

          const isInDateRange = consultation.startTime >= startOfDay && consultation.startTime <= endOfDay;
          const matchesDoctorId = doctorId ? consultation.doctorId === doctorId : true;
          const matchesPatientId = patientId ? consultation.patientId === patientId : true;

          // console.log(
          //   "Is in range?", isInDateRange,
          //   "Matches doctor ID?", matchesDoctorId,
          //   "Matches patient ID?", matchesPatientId
          // );

          return isInDateRange && matchesDoctorId && matchesPatientId;
        });
      })
    ) as Observable<Consultation[]>;
  }


  async cancelAllConsultationForDay(doctorId: string, targetDate: Date): Promise<void> {
    // Calculate the start and end of the target day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0); // Start of the day: 00:00:00

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999); // End of the day: 23:59:59

    // Query consultations within the date range
    const colRef = collection(this.store, 'consultations');
    const q = query(
      colRef,
      where('doctorId', '==', doctorId),
      where('startTime', '>=', startOfDay),
      where('startTime', '<=', endOfDay)
    );

    try {
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(this.store); // Create a batch for atomic updates

      querySnapshot.forEach(docSnapshot => {
        const consultationDocRef = doc(this.store, 'consultations', docSnapshot.id);
        batch.update(consultationDocRef, { status: 'cancelled' }); // Set status to 'cancelled'
      });

      // Commit batch update
      await batch.commit(); // Wait for the batch to be committed
    } catch (err) {
      throw new Error('Error cancelling consultations: ' + err);
    }
  }



  async isConsultationAtTime(date: Date, doctorId: string): Promise<Consultation | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0); // Początek dnia

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999); // Koniec dnia

    const consultationsRef = collection(this.store, 'consultations');
    const q = query(
      consultationsRef,
      where('startTime', '<=', endOfDay),  // startTime przed końcem dnia
      where('endTime', '>=', startOfDay),  // endTime po początku dnia
      where('doctorId', '==', doctorId)  // Sprawdzanie po ID doktora
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
