import { useState } from 'react';
import { Layout } from '../components/Layout';
import { 
  MapPin, 
  User, 
  Phone, 
  TrendingUp, 
  TrendingDown, 
  MoreVertical, 
  Plus, 
  Users, 
  HeartPulse, 
  IndianRupee,
  Search,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import type { ClinicBranch, BranchStatus } from '../types/branches';
import BranchModal from '@/components/dashboard/BranchModal';

export function Branches() {
  const { branches: allBranches, addBranch, staff: allStaff, patients: allPatients, invoices: allInvoices } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const branches = allBranches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.manager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveBranch = (data: any) => {
    const newBranch = {
      ...data,
      id: `BR-${Math.floor(Math.random() * 1000)}`,
      staffCount: 0,
      patientCount: 0,
      totalRevenue: 0,
      performance: {
        weeklyRevenue: [0, 0, 0, 0, 0, 0, 0],
        revenueGrowth: 0
      }
    };
    addBranch(newBranch);
    setIsModalOpen(false);
  };

  const getStatusColor = (status: BranchStatus) => {
    switch (status) {
      case 'Active': return 'bg-primary/10 text-primary border-primary/20';
      case 'Maintenance': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Expanding': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Branches</h1>
            <p className="text-slate-500 mt-1">Manage your clinic locations</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary hover:bg-[#4a9f9f] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Add New Branch</span>
          </button>
        </div>

        <BranchModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBranch}
        />

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="relative w-full group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search branches..." 
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Simple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map(branch => (
            <div key={branch.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                  {branch.name[0]}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">{branch.name}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold border border-slate-200">
                    BRANCH CODE: {branch.branchCode}
                  </span>
                </div>
                
                <div className="flex items-start space-x-2 text-slate-500">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-primary" />
                  <p className="text-sm leading-relaxed">{branch.address}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-tighter">{branch.manager}</span>
                  </div>
                  
                  <a href={`tel:${branch.phone}`} className="flex items-center space-x-1.5 text-primary hover:text-[#4a9f9f] transition-colors">
                    <Phone size={14} />
                    <span className="text-xs font-bold">{branch.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
