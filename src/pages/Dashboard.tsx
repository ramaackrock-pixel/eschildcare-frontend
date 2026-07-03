import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { StatCards } from '@/components/dashboard/StatCards';
import { AppointmentStatus } from '@/components/dashboard/AppointmentStatus';
import { RecentPatients } from '@/components/dashboard/RecentPatients';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { useAppData } from '@/context/AppDataContext';
import { apiService } from '@/services/apiService';
import AppointmentModal from '@/components/dashboard/AppointmentModal';

export function Dashboard() {
  const { addAppointment, branches } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [timeRange, setTimeRange] = useState('Daily');

  const handleSaveAppointment = (data: any) => {
    addAppointment(data);
    setIsModalOpen(false);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, here is what's happening today.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-slate-100 rounded-lg p-1 space-x-1 shrink-0">
            {['Daily', 'Weekly', 'Monthly'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${timeRange === range
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative shrink-0 flex-grow md:flex-grow-0">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full appearance-none bg-[#e0f4f4] text-primary font-semibold text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none border-none cursor-pointer h-[36px]"
              >
                <option>All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.name}>{branch.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-shrink-0 bg-primary/80 hover:bg-[#328585] text-white text-sm font-bold py-2 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2 h-[36px]"
            >
              <span className="text-lg leading-none">+</span>
              <span className="whitespace-nowrap uppercase">New Appointment</span>
            </button>
          </div>
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAppointment}
      />

      <StatCards branch={selectedBranch} timeRange={timeRange} />

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
        <AppointmentStatus branch={selectedBranch} timeRange={timeRange} />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <RecentPatients branch={selectedBranch} timeRange={timeRange} />
        <UpcomingAppointments branch={selectedBranch} timeRange={timeRange} />
      </div>
    </Layout>
  );
}
