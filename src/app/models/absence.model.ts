import {Timestamp} from 'firebase/firestore';

export interface Absence {
  id?: string;
  startDate: Timestamp;
  endDate: Timestamp;
}
