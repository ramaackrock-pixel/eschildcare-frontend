export interface AppointmentDetails {
  phone: string;
  email: string;
  lastVisit: string;
  condition: string;
  nextSteps: string;
}

export interface Appointment {
  id: number | string;
  time: string;
  duration: string | number;
  appointmentDate?: string;
  patientName: string;
  pid?: string;
  patientId?: string;
  initials: string;
  initialsBg: string;
  doctorId?: string;
  doctorName?: string;
  therapists?: { id: string; name: string }[];
  therapist?: string;
  branch: string;
  sessionType: string;
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  details: AppointmentDetails;
}
