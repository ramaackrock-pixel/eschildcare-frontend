export interface RevenuePoint {
  month: string;
  revenue: number;
  target: number;
}

export interface DemographicPoint {
  category: string;
  count: number;
  color: string;
}

export interface TreatmentPoint {
  service: string;
  sessions: number;
}

export interface BranchPerformancePoint {
  branch: string;
  patients: number;
  revenue: number;
}

export interface OperationalMetric {
  label: string;
  value: string | number;
  trend: number;
  suffix?: string;
  prefix?: string;
}
