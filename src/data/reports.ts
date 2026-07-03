import type { 
  RevenuePoint, 
  DemographicPoint, 
  TreatmentPoint, 
  BranchPerformancePoint,
  OperationalMetric 
} from '../types/reports';

export const REVENUE_TRENDS: RevenuePoint[] = [
  { month: 'Jan', revenue: 1450000, target: 1200000 },
  { month: 'Feb', revenue: 1680000, target: 1400000 },
  { month: 'Mar', revenue: 1920000, target: 1700000 },
  { month: 'Apr', revenue: 2150000, target: 2000000 },
  { month: 'May', revenue: 2480000, target: 2300000 },
  { month: 'Jun', revenue: 2820000, target: 2600000 },
  { month: 'Jul', revenue: 2650000, target: 2800000 },
  { month: 'Aug', revenue: 3100000, target: 3000000 },
  { month: 'Sep', revenue: 3450000, target: 3200000 },
  { month: 'Oct', revenue: 3820000, target: 3500000 }
];

export const PATIENT_DEMOGRAPHICS: DemographicPoint[] = [
  { category: 'Ages 0-18', count: 450, color: '#99f6e4' },
  { category: 'Ages 19-35', count: 1240, color: '#5eead4' },
  { category: 'Ages 36-50', count: 890, color: '#2dd4bf' },
  { category: 'Ages 51-65', count: 620, color: '#14b8a6' },
  { category: 'Ages 65+', count: 320, color: '#0f766e' }
];

export const TREATMENT_POPULARITY: TreatmentPoint[] = [
  { service: 'Manual Therapy', sessions: 1450 },
  { service: 'Electrotherapy', sessions: 890 },
  { service: 'Exercise Prog', sessions: 640 },
  { service: 'Acupuncture', sessions: 420 },
  { service: 'Hydrotherapy', sessions: 280 },
  { service: 'Sports Rehab', sessions: 1200 }
];

export const BRANCH_ANALYTICS: BranchPerformancePoint[] = [
  { branch: 'Main branch', patients: 1450, revenue: 2854000 },
  { branch: 'Other branch', patients: 890, revenue: 1240500 }
];

export const KEY_OPERATIONAL_METRICS: OperationalMetric[] = [
  { label: 'Avg Collection Period', value: 14, trend: -12.5, suffix: ' Days' },
  { label: 'Patient Retention', value: 84, trend: 5.2, suffix: '%' },
  { label: 'No-Show Rate', value: 4.2, trend: -8.1, suffix: '%' },
  { label: 'Staff Utilization', value: 91, trend: 2.4, suffix: '%' }
];
