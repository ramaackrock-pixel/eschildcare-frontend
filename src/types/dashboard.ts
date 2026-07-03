export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  iconBg: string;
  trendBg: string;
}

export interface UpcomingAppointment {
  time: string;
  period: string;
  name: string;
  therapist: string;
  status: string;
  statusColor: string;
}
