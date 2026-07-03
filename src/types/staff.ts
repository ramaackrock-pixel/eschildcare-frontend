export type StaffTab = 'List' | 'Attendance' | 'Schedules' | 'Payroll';

export type StaffStatus = 'Active' | 'Inactive';
export type AttendanceStatus = 'Present' | 'Late' | 'Leave' | 'Absent';
export type ShiftType = 'Morning' | 'Night' | 'Evening';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  branch: string;
  mobile: string;
  status: StaffStatus;
  avatar: string;
  initials?: string;
  initialsBg?: string;
  joiningDate?: string;
  aadharNumber?: string;
  degreeCertificate?: string;
  scheduleDays?: string[];
  shift?: string;
  workingMode?: string;
  workingHours?: string;
  attendanceLogs?: Array<{
    date: string;
    checkInTime?: string;
    checkOutTime?: string;
    status: string;
    location?: string;
  }>;
  payrollLogs?: Array<{
    month: string;
    daysPresent: number;
    salary: number;
    deductions: number;
    bonus: number;
    netPay: number;
  }>;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  date: string;
  status: AttendanceStatus;
  checkInTime: string;
  remarks: string;
  avatar: string;
}

export interface ScheduleRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  shift: ShiftType;
  workingHours: string;
  assignedBranch: string;
  days: string[]; // ['M', 'T', 'W', 'T', 'F', 'S']
  avatar: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  daysPresent: string; // e.g., "22/22"
  salary: number;
  deductions: number;
  bonus: number;
  netPay: number;
  avatar: string;
}
