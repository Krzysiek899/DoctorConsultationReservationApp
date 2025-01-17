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

      this.authService.login(email, password).subscribe({
        next: () => {
          // Po udanym logowaniu przekierowanie na stronę główną lub dashboard
          //this.router.navigate(['/dashboard']);
          alert("Sukces")
        },
        error: (error) => {
          // Obsługuje błąd, jeśli logowanie nie powiedzie się
          // this.errorMessage = error.message;
          alert(error);
        }
      });
    }
  }
}
