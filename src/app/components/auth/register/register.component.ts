import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth/auth.service';
import {NgIf} from '@angular/common';
import {AuthFireService} from '../../../services/auth/fire/auth-fire.service';
import {Router} from '@angular/router';

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

  constructor(private formBuilder: FormBuilder, private authService: AuthFireService, private router: Router) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      repeatPassword: ['', [Validators.required]],
      userName: ['', [Validators.required]],
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
        userName,
        firstName,
        lastName,
        accountType,
        specialization
      } = this.registerForm.value;

      this.authService.register(email, userName, password, firstName, lastName, accountType, specialization).subscribe(
        ()=> this.router.navigateByUrl('/doctors')
      )
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
