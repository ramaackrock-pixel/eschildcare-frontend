export type BranchStatus = 'Active' | 'Maintenance' | 'Expanding';

export interface BranchPerformance {
  weeklyRevenue: number[]; // Sparkline data [7 days]
  revenueGrowth: number;   // % Growth
}

export type ClinicBranch = {
  id: string;
  _id?: string;
  name: string;
  address: string;
  manager: string;
  phone: string;
  branchCode: string;
  staffCount: number;
  patientCount: number;
  totalRevenue: number;
  status: BranchStatus;
  performance: BranchPerformance;
  image: string;
};
