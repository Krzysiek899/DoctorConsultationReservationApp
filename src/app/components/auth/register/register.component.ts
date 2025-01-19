import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      accountType: ['', [Validators.required]],
      specialization: ['']
    });
  }

  // Method to handle form submission
  onSubmit(): void {
    if (this.registerForm.valid) {
      const {
        email,
        password,
        repeatPassword,
        firstName,
        lastName,
        accountType,
        specialization
      } = this.registerForm.value;

      this.authService.register(email, password, accountType)
    } else {

      this.registerForm.markAllAsTouched();
    }
  }

  // Custom validation to check if passwords match
  get passwordMismatch() {
    const password = this.registerForm.get('password');
    const repeatPassword = this.registerForm.get('repeatPassword');
    return password && repeatPassword && password.value !== repeatPassword.value;
  }
}
