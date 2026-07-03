import { useAppData } from '@/context/AppDataContext';
import { isWithinTimeRange } from '@/utils/dateFilter';

export function UpcomingAppointments({ branch, timeRange }: { branch: string, timeRange?: string }) {
  const { appointments: allAppointments } = useAppData();

  const appointments = (branch === 'All Branches' 
    ? allAppointments 
    : allAppointments.filter(a => a.branch === branch)
  )
  .filter(a => timeRange ? isWithinTimeRange(a.appointmentDate, timeRange) : true)
  .slice(0, 5);

  const statusColors: Record<string, string> = {
    CONFIRMED: 'text-[#2e8b8b] border-[#2e8b8b] bg-emerald-50',
    PENDING: 'text-orange-500 border-orange-500 bg-orange-50',
    COMPLETED: 'text-blue-500 border-blue-500 bg-blue-50',
    CANCELLED: 'text-red-500 border-red-500 bg-red-50',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex-1">
      <div className="p-6 flex justify-between items-center border-b border-slate-50">
        <h3 className="font-bold text-slate-800">Upcoming Appointments</h3>
        <span className="text-[#3b82f6] text-xs font-bold">Today</span>
      </div>

      <div className="divide-y divide-slate-50">
        {appointments.map((appt, i) => (
          <div key={i} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="flex items-start space-x-6">
              <div className="text-center w-12 pt-1 border-r border-slate-200 pr-4">
                <span className="block font-bold text-[#3b82f6] text-[11px] leading-tight">{appt.time.split(' ')[0]}</span>
                <span className="text-[10px] font-bold text-slate-400">{appt.time.split(' ')[1]}</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{appt.patientName}</h4>
                <p className="text-xs text-slate-500 mt-1">Therapist: {appt.therapist}</p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[appt.status]}`}>
              {appt.status}
            </span>
          </div>
        ))}
        {appointments.length === 0 && (
          <div className="p-12 text-center text-slate-500 font-medium">
            No upcoming appointments.
          </div>
        )}
      </div>
    </div>
  );
}
