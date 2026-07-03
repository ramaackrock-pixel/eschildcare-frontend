export type MedicalRecordType = 'X-RAY' | 'MRI' | 'PRESCRIPTION' | 'REPORT';

export interface MedicalRecord {
  id: string;
  patientName: string;
  pid: string;
  recordType: MedicalRecordType;
  fileName: string;
  fileUrl?: string;
  uploadedDate: string;
  doctor: string;
  initials: string;
  initialsBg: string;
  branch?: string;
}

export interface MedicalRecordStat {
  label: string;
  value: string;
  subtext: string;
  icon: 'storage' | 'certified' | 'activity';
  trend?: string;
}
