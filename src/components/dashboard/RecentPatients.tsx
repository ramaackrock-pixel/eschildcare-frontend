import { useState } from 'react';
import { useAppData } from '@/context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function RecentPatients({ branch, timeRange }: { branch: string, timeRange?: string }) {
  const { patients: allPatients } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const todayStr = new Date().toDateString();

  const patients = (branch === 'All Branches' 
    ? allPatients 
    : allPatients.filter(p => p.branch === branch)
  ).filter(p => {
    try {
      return new Date(p.lastVisit).toDateString() === todayStr || (p.createdAt && new Date(p.createdAt).toDateString() === todayStr);
    } catch (e) {
      return false;
    }
  });

  const totalPages = Math.ceil(patients.length / itemsPerPage);
  const paginatedPatients = patients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm flex-1">
      <div className="p-6 flex justify-between items-center border-b border-slate-50">
        <h3 className="font-bold text-slate-800">Recent Patients</h3>
        <button onClick={() => navigate('/patients')} className="text-[#3b82f6] text-xs font-bold hover:underline">View All</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#e0f4f4] text-[10px] uppercase tracking-wider text-slate-600">
              <th className="px-6 py-3 font-semibold w-[25%]">Name</th>
              <th className="px-6 py-3 font-semibold">Contact</th>
              <th className="px-6 py-3 font-semibold w-[20%]">Address</th>
              <th className="px-6 py-3 font-semibold">PID</th>
              <th className="px-6 py-3 font-semibold">Consulted By</th>
              <th className="px-6 py-3 font-semibold">Last Visit</th>
              <th className="px-6 py-3 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {paginatedPatients.map((patient, i) => (
              <tr 
                key={i} 
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <td className="px-6 py-4 flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${patient.initialsBg}`}>
                    {patient.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-800">{patient.name}</div>
                      {(() => {
                        try {
                          const visitDate = new Date(patient.lastVisit).toDateString();
                          const today = new Date().toDateString();
                          if (visitDate === today) {
                            return <span className="bg-[#e0f4f4] text-primary text-[8px] font-black px-1.5 py-0.5 rounded-md tracking-tighter">NEW</span>;
                          }
                        } catch (e) {
                          return null;
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">
                  {patient.contact}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  <div className="truncate max-w-[150px]" title={patient.address}>
                    {patient.address || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{patient.pid}</td>
                <td className="px-6 py-4 text-slate-700 font-medium">{patient.consultedBy}</td>
                <td className="px-6 py-4 text-slate-500">{patient.lastVisit}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${patient.statusColor}`}>
                    {patient.status}
                  </span>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">
                  No recent patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-50 flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, patients.length)} of {patients.length} today
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
