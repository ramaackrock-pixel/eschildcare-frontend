export type Role = 'superadmin' | 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  jobRole?: string;  // e.g. 'Physiotherapist' – only for staff
  branch?: string;   // Registered branch for staff
  avatar?: string;
}
