import { Users, Calendar, Banknote, ClipboardClock, BriefcaseMedical } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { isWithinTimeRange } from '@/utils/dateFilter';

export function StatCards({ branch, timeRange }: { branch: string, timeRange?: string }) {
  const { patients: allPatients, appointments: allAppointments, staff: allStaff, invoices: allInvoices } = useAppData();
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';

  const patients = (branch === 'All Branches' ? allPatients : allPatients.filter(p => p.branch === branch))
    .filter(p => timeRange ? isWithinTimeRange(p.createdAt || p.lastVisit, timeRange) : true);
  const appointments = (branch === 'All Branches' ? allAppointments : allAppointments.filter(a => a.branch === branch))
    .filter(a => timeRange ? isWithinTimeRange(a.appointmentDate, timeRange) : true);
  const staff = branch === 'All Branches' ? allStaff : allStaff.filter(s => s.branch === branch);
  const invoices = (branch === 'All Branches' ? allInvoices : allInvoices.filter(i => i.branch === branch))
    .filter(i => timeRange ? isWithinTimeRange(i.date, timeRange) : true);

  const activeInvoicesCount = invoices.filter(i => i.status !== 'PAID').length;

  const stats = [
    {
      title: 'Total Patients',
      value: patients.length,
      iconName: 'Users',
      iconBg: 'bg-[#e0f4f4]',
      hidden: false
    },
    {
      title: 'Total Appointments',
      value: appointments.length,
      iconName: 'Calendar',
      iconBg: 'bg-[#e0f4f4]',
      hidden: false
    },
    {
      title: 'Active Invoices',
      value: activeInvoicesCount,
      iconName: 'Banknote',
      iconBg: 'bg-[#e0f4f4]',
      hidden: isStaff
    },
    {
       title: 'Clinic Staff',
       value: staff.length,
       iconName: 'BriefcaseMedical',
       iconBg: 'bg-[#e0f4f4]',
       hidden: false
    }
  ].filter(s => !s.hidden);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users size={20} className="text-[#138db5]" />;
      case 'Calendar': return <Calendar size={20} className="text-[#138db5]" />;
      case 'Banknote': return <Banknote size={20} className="text-[#138db5]" />;
      case 'ClipboardClock': return <ClipboardClock size={20} className="text-[#138db5]" />;
      case 'BriefcaseMedical': return <BriefcaseMedical size={20} className="text-[#138db5]" />;
      default: return null;
    }
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${stats.length} gap-4 mb-6`}>
      {stats.map((stat) => (
        <div 
          key={stat.title} 
          className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
              {getIcon(stat.iconName)}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
