import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import {provideRouter} from '@angular/router';
import {routes} from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';




bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    { provide: FIREBASE_OPTIONS, useValue: environment.firebase },
    provideRouter(routes)
  ],
}).catch((err) => console.error(err));
