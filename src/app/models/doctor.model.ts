import {Availability} from './availability.model';

export interface Doctor {
  firstName: string;
  lastName: string;
  specialization: string;
  availabilities: Array<Availability>;
  absences: Array<Availability>;
}
