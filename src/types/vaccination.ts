export interface Vaccination {
  _id?: string;
  id?: string;
  patientId: string;
  patientName: string;
  patientPid?: string;
  vaccineName: string;
  givenDate: string | Date;
  nextDueDate: string | Date;
  status: 'COMPLETED' | 'UPCOMING' | 'OVERDUE';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
