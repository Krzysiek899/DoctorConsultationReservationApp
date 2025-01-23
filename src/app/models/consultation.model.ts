export interface Consultation {
  id?: string;
  startTime: Date;
  endTime: Date;
  doctorId: string;
  patientId: string;
  firstName: string;
  lastName: string;
  type: string;
  status: 'ok' | 'canceled';
  sex: string;
  age: number;
  info?: string;
}

export enum ConsultationType {
  General = 'General',
  Therapy = 'Therapy',
  CheckUp = 'CheckUp',
  Emergency = 'Emergency'
}
