import {Availability} from './availability.model';

export interface Doctor {
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  availabilities: Array<Availability>;
  absences: Array<Availability>;
}
