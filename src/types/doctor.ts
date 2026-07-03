export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role?: string;
  avatar?: string;
  initials?: string;
  initialsBg?: string;
}
