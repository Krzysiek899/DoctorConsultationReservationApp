import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  standalone: true
})
export class LoginComponent {

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;

      this.authService.login(email, password)
        .then(() => {
          // Akcja po pomyślnym zalogowaniu (np. nawigacja do strony głównej)
          console.log('Login successful!');
        })
        .catch((error) => {
          // Obsługa błędów logowania
          console.error('Login failed:', error);
          alert('Nie udało się zalogować. Sprawdź swoje dane.');
        });
    } else {
      // Obsługa walidacji formularza
      console.error('Formularz jest niepoprawny!');
    }
  }
}
