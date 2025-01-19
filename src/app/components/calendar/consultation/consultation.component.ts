import {Component, Input, OnInit} from '@angular/core';
import {Consultation} from '../../../models/consultation.model';
import {NgClass, NgStyle} from '@angular/common';

@Component({
  selector: 'app-consultation',
  imports: [
    NgStyle,
    NgClass
  ],
  templateUrl: './consultation.component.html',
  standalone: true,
  styleUrl: './consultation.component.css'
})
export class ConsultationComponent {
  @Input({required: true}) consultation!: Consultation;

  showDetails: boolean = false;

  getClass() : string {
    if (this.consultation.endTime < new Date()) {
      return "past";
    } else {
      return this.consultation.type;
    }
  }



}
