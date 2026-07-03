export type AdmissionStatus = 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRING';

export type AdmittedPatient = {
  id: string;
  patientId: string;
  patientName: string;
  roomNumber: string;
  admissionDate: string;
  dischargeDate?: string;
  department: string;
  attendingDoctor: string;
  status: AdmissionStatus;
  totalFees: number;
  paidFees: number;
};

export type Room = {
  id: string;
  number: string;
  type: 'GENERAL' | 'SEMIPRIVATE' | 'PRIVATE' | 'ICU';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  pricePerDay: number;
  department: string;
};
