import { MapPin } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';

export function BranchPerformance() {
  const { branches } = useAppData();

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">Branch Performance</h2>
        <button className="text-primary text-xs font-bold uppercase hover:underline">
          View Detailed Report →
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div 
            key={branch.id} 
            className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 cursor-pointer"
          >
            <div className="flex items-center space-x-4 mb-6 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-primary/10`}>
                <MapPin size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-[15px]">{branch.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                  {branch.status.toUpperCase()}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-auto">
              <div className="text-center w-1/3">
                <p className="text-[10px] font-bold text-slate-400 mb-1">REVENUE</p>
                <p className="font-bold text-primary">₹{(branch.totalRevenue / 1000).toFixed(1)}k</p>
              </div>
              <div className="text-center w-1/3 border-l border-r border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 mb-1">PATIENTS</p>
                <p className="font-bold text-[#3b82f6]">{branch.patientCount}</p>
              </div>
              <div className="text-center w-1/3">
                <p className="text-[10px] font-bold text-slate-400 mb-1">STAFF</p>
                <p className="font-bold text-[#3b82f6]">{branch.staffCount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
