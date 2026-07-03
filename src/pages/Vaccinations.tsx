import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAppData } from '@/context/AppDataContext';
import { Syringe, Plus, Search, Calendar, FilterX, Trash2, Pencil, CalendarClock, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import VaccinationModal from '@/components/dashboard/VaccinationModal';
import toast from 'react-hot-toast';

export function Vaccinations() {
  const { vaccinations, addVaccination, updateVaccination, deleteVaccination } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<any>(null);

  const filteredVaccinations = vaccinations.filter(v => {
    const matchesSearch = v.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vaccineName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (data: any) => {
    try {
      if (editingVaccination) {
        await updateVaccination(editingVaccination._id || editingVaccination.id, data);
        toast.success("Vaccination record updated!");
      } else {
        await addVaccination(data);
        toast.success("Vaccination record added!");
      }
      setIsModalOpen(false);
      setEditingVaccination(null);
    } catch (e) {
      toast.error("Failed to save vaccination record");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vaccination record?")) {
      try {
        await deleteVaccination(id);
        toast.success("Record deleted");
      } catch (e) {
        toast.error("Failed to delete record");
      }
    }
  };

  const handleExportToday = () => {
    const todayStr = new Date().toDateString();
    const todayVaccinations = vaccinations.filter(v => {
      try {
        return new Date(v.nextDueDate).toDateString() === todayStr;
      } catch (e) {
        return false;
      }
    });

    if (todayVaccinations.length === 0) {
      toast.error("No vaccinations due today to export");
      return;
    }

    const data = todayVaccinations.map(v => ({
      'Patient Name': v.patientName,
      'Vaccine': v.vaccineName,
      'Due Date': new Date(v.nextDueDate).toLocaleDateString(),
      'Administered Date': v.givenDate ? new Date(v.givenDate).toLocaleDateString() : 'N/A',
      'Status': v.status,
      'Notes': v.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Today's Vaccinations");
    XLSX.writeFile(wb, `vaccinations_due_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Syringe className="text-primary" size={32} />
            Vaccination Log
          </h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Track patient immunizations and automated reminders.
          </p>
        </div>
        <button
          onClick={() => { setEditingVaccination(null); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          Log Vaccination
        </button>
      </div>

      <div className="bg-white rounded-3xl p-4 mb-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient or vaccine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold min-w-[160px]"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            title="Clear Filters"
          >
            <FilterX size={20} />
          </button>
          <button
            onClick={handleExportToday}
            className="flex items-center gap-2 px-4 py-3 bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] hover:bg-[#c8e6c9] font-bold text-sm rounded-xl transition-all whitespace-nowrap"
            title="Download Today's Vaccinations"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export Today</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Vaccine</th>
                <th className="px-6 py-4">Given Date</th>
                <th className="px-6 py-4">Next Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredVaccinations.length > 0 ? filteredVaccinations.map((vac) => (
                <tr key={vac._id || vac.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{vac.patientName}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">{vac.patientPid || 'PID N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Syringe size={14} />
                      </div>
                      <span className="font-bold text-slate-700">{vac.vaccineName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {new Date(vac.givenDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <CalendarClock size={16} className="text-slate-400" />
                      {new Date(vac.nextDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">
                      Reminder exactly 1 day before
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${vac.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      vac.status === 'OVERDUE' ? 'bg-red-50 text-red-600 border border-red-100' :
                        'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                      {vac.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingVaccination(vac); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(vac._id || vac.id || '')}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    No vaccinations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VaccinationModal
        vaccination={editingVaccination}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </Layout>
  );
}
