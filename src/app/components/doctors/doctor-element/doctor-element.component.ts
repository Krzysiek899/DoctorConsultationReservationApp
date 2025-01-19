import {Component, Input} from '@angular/core';
import {Doctor} from '../../../models/doctor.model';

@Component({
  selector: 'app-doctor-element',
  imports: [],
  templateUrl: './doctor-element.component.html',
  standalone: true,
  styleUrl: './doctor-element.component.css'
})
export class DoctorElementComponent {
  @Input({required: true}) doctor!: Doctor;
}
