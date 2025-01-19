import {Component, OnInit} from '@angular/core';
import {DatabaseFireService} from '../../../services/database/fire/database-fire.service';
import {Doctor} from '../../../models/doctor.model';
import {Observable} from 'rxjs';
import {AsyncPipe} from '@angular/common';
import {DoctorElementComponent} from '../doctor-element/doctor-element.component';

@Component({
  selector: 'app-doctor-list',
  imports: [
    AsyncPipe,
    DoctorElementComponent
  ],
  templateUrl: './doctor-list.component.html',
  standalone: true,
  styleUrl: './doctor-list.component.css'
})
export class DoctorListComponent implements OnInit{

  doctors$!: Observable<Doctor[]>;

  constructor( private databaseService : DatabaseFireService) {}

  ngOnInit():void {
    this.doctors$ = this.databaseService.getDoctors();
  }

}
