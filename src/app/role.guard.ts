import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import {AuthFireService} from './services/auth/fire/auth-fire.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthFireService);
  const router = inject(Router);

  // Pobranie wymaganej roli z konfiguracji trasy (np. { role: 'doctor' })
  const expectedRole: 'doctor' | 'patient' = route.data['role'];

  return authService.currentUser$.pipe(
    map(user => {
      if (user && user.role === expectedRole) {
        return true;  // Użytkownik ma poprawną rolę, dostęp przyznany
      } else {
        console.warn(`Brak dostępu: wymagana rola '${expectedRole}', aktualna rola: '${user?.role || 'brak'}'`);
        router.navigate(['/']);  // Przekierowanie na stronę główną
        return false;
      }
    }),
    catchError(error => {
      console.error('Błąd podczas weryfikacji roli:', error);
      router.navigate(['/login']);  // Przekierowanie w przypadku błędu
      return of(false);
    })
  );
};
