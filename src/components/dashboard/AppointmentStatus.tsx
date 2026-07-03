
import { useAppData } from '@/context/AppDataContext';
import { isWithinTimeRange } from '@/utils/dateFilter';

export function AppointmentStatus({ branch, timeRange }: { branch: string, timeRange?: string }) {
  const { appointments: allAppointments } = useAppData();

  const appointments = (branch === 'All Branches' ? allAppointments : allAppointments.filter(a => a.branch === branch))
    .filter(a => timeRange ? isWithinTimeRange(a.appointmentDate, timeRange) : true);

  const total = appointments.length || 1;
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
  const pending = appointments.filter(a => a.status === 'PENDING').length;
  const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;

  const stats = [
    { label: 'Confirmed', count: confirmed, percentage: Math.round((confirmed / total) * 100), color: 'bg-primary' },
    { label: 'Pending', count: pending, percentage: Math.round((pending / total) * 100), color: 'bg-blue-300' },
    { label: 'Cancelled', count: cancelled, percentage: Math.round((cancelled / total) * 100), color: 'bg-red-400' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm col-span-1">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-800">Appointment Status</h3>
        <span className="text-xs font-medium text-slate-500">Global</span>
      </div>

      <div className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="flex justify-between items-center mb-2 text-sm">
              <span className="font-medium text-slate-600">{stat.label}</span>
              <span className="font-bold text-slate-800">{stat.count} <span className="text-slate-400 font-normal">({stat.percentage}%)</span></span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.color} rounded-full`}
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
