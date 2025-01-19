export interface Consultation {
  id: number;
  startTime: Date;
  endTime: Date;
  doctorId: number;
  patientId: number;
  type: string;
}

// export enum ConsultationType {
//   General = 'General',
//   Therapy = 'Therapy',
//   CheckUp = 'CheckUp',
//   Emergency = 'Emergency'
// }
