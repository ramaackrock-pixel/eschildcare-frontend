import { useState, useMemo, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import {
  ChevronDown,
  Calendar,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  ClipboardList,
  XCircle
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useSearch } from '@/context/SearchContext';
import { apiService } from '@/services/apiService';
import AppointmentModal from '@/components/dashboard/AppointmentModal';
import type { Appointment } from '@/types/appointment';

const ITEMS_PER_PAGE = 10;

const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function Appointments() {
  const { searchQuery } = useSearch();
  const { appointments, addAppointment, updateAppointment, deleteAppointment, branches, doctors } = useAppData();
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [therapistFilter, setTherapistFilter] = useState('All Therapists');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState(getLocalDateString());

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      const patientName = app.patientName || '';
      const pid = app.pid || '';
      const matchesSearch =
        patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBranch = branchFilter === 'All Branches' || app.branch === branchFilter;
      const matchesTherapist = therapistFilter === 'All Therapists' || app.therapist === therapistFilter;
      const matchesStatus = statusFilter === 'All Status' || app.status === statusFilter;
      const matchesDate = !dateFilter || (app.appointmentDate && getLocalDateString(new Date(app.appointmentDate)) === dateFilter);
      return matchesSearch && matchesBranch && matchesTherapist && matchesStatus && matchesDate;
    });
  }, [appointments, searchQuery, branchFilter, therapistFilter, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleClearFilters = () => {
    setBranchFilter('All Branches');
    setTherapistFilter('All Therapists');
    setStatusFilter('All Status');
    setDateFilter(getLocalDateString());
    setCurrentPage(1);
  };

  const handleSaveAppointment = (data: any) => {
    if (editingAppointment) {
      updateAppointment(data);
    } else {
      addAppointment(data);
    }
    setIsModalOpen(false);
    setEditingAppointment(null);
  };

  const statusColors: Record<string, string> = {
    CONFIRMED: 'text-[#2e8b8b] border-[#2e8b8b] bg-emerald-50',
    PENDING: 'text-orange-500 border-orange-500 bg-orange-50',
    COMPLETED: 'text-blue-500 border-blue-500 bg-blue-50',
    CANCELLED: 'text-red-500 border-red-500 bg-red-50',
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Appointments</h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Manage all scheduled appointments
          </p>
        </div>
        <button
          onClick={() => { setEditingAppointment(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2"
        >
          <span className="text-lg leading-none">+</span>
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Date</label>
            <div className="relative">
              <div className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg px-4 py-1.5 flex items-center space-x-2">
                <Calendar size={14} className="text-slate-400" />
                <input 
                  type="date" 
                  value={dateFilter}
                  onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Branch</label>
            <div className="relative px-0">
              <select
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Therapist</label>
            <div className="relative px-0">
              <select
                value={therapistFilter}
                onChange={(e) => { setTherapistFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>All Therapists</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.name}>{doc.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <div className="relative px-0">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option>All Status</option>
                <option>CONFIRMED</option>
                <option>PENDING</option>
                <option>COMPLETED</option>
                <option>CANCELLED</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>
        </div>
        <button
          onClick={handleClearFilters}
          className="mt-6 text-[#1e85b4] font-bold text-xs hover:underline flex items-center space-x-2"
        >
          <span>Clear filters</span>
        </button>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#dcf4f4] text-[10px] uppercase tracking-wider text-slate-700">
                <th className="px-6 py-4 font-bold">Time</th>
                <th className="px-6 py-4 font-bold">Patient Name</th>
                <th className="px-6 py-4 font-bold">Doctor</th>
                <th className="px-6 py-4 font-bold">Therapist(s)</th>
                <th className="px-6 py-4 font-bold">Branch</th>
                <th className="px-6 py-4 font-bold">Session Type</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedAppointments.length > 0 ? paginatedAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{app.time}</div>
                    <div className={`text-[10px] mt-0.5 ${app.status === 'CANCELLED' ? 'text-red-400 font-medium' : 'text-slate-500'}`}>
                      {app.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{app.patientName}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{app.doctorName || '-'}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {app.therapists && app.therapists.length > 0
                      ? app.therapists.map((t: any) => t.name).join(', ')
                      : (app.therapist && app.therapist !== 'Unassigned' ? app.therapist : '-')}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{app.branch}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wide">
                      {app.sessionType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-full border ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === app.id ? null : app.id)}
                      className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeMenuId === app.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-12 top-10 w-36 bg-white border border-slate-100 shadow-xl rounded-lg py-1 z-10 transition-all animate-in fade-in zoom-in duration-100"
                      >
                        <button
                          onClick={() => {
                            setViewingAppointment(app);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#dcf4f4] hover:text-[#2e8b8b] flex items-center space-x-2"
                        >
                          <Eye size={14} />
                          <span>View Detail</span>
                        </button>
                        <button
                          onClick={() => {
                            setEditingAppointment(app);
                            setIsModalOpen(true);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#dcf4f4] hover:text-[#2e8b8b] flex items-center space-x-2"
                        >
                          <Pencil size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete appointment for ${app.patientName}?`)) {
                              deleteAppointment(app.id);
                            }
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 font-medium italic">
                    No appointments found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <span className="font-medium uppercase text-[10px] tracking-wider font-bold text-slate-400">
            Showing <span className="text-primary">{paginatedAppointments.length}</span> of {filteredAppointments.length} Scheduled
          </span>
          <div className="flex items-center space-x-3 font-semibold">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-primary hover:bg-primary/10 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {appointments.filter(a => a.status === 'CONFIRMED').length}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CONFIRMED</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-orange-50 rounded-lg">
            <Clock size={24} className="text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {appointments.filter(a => a.status === 'PENDING').length}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PENDING</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <ClipboardList size={24} className="text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {appointments.filter(a => a.status === 'COMPLETED').length}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">COMPLETED</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-red-50 rounded-lg">
            <XCircle size={24} className="text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">
              {appointments.filter(a => a.status === 'CANCELLED').length}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CANCELLED</p>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        appointment={editingAppointment}
        onClose={() => { setIsModalOpen(false); setEditingAppointment(null); }}
        onSave={handleSaveAppointment}
      />

      {/* View Detail Modal */}
      {viewingAppointment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setViewingAppointment(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className={`h-24 ${viewingAppointment.initialsBg} flex items-end justify-between px-8 pb-4 relative`}>
              <div className="flex items-center space-x-4 translate-y-8">
                <div className={`w-20 h-20 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold ${viewingAppointment.initialsBg}`}>
                  {viewingAppointment.initials}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{viewingAppointment.patientName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusColors[viewingAppointment.status]}`}>
                      {viewingAppointment.status}
                    </span>
                    <span className="text-slate-500 text-xs font-medium">{viewingAppointment.sessionType}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewingAppointment(null)}
                className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white absolute top-4 right-4"
              >
                <X size={20} />
              </button>
            </div>

            <div className="pt-16 px-8 pb-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Contact</p>
                  <p className="text-sm font-semibold text-slate-700">{viewingAppointment.details?.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold text-slate-700">{viewingAppointment.details?.email || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Visit Date</p>
                  <p className="text-sm font-semibold text-slate-700">{viewingAppointment.details?.lastVisit || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinic Branch</p>
                  <p className="text-sm font-semibold text-slate-700">{viewingAppointment.branch}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Clinical Condition</p>
                  <p className="text-sm font-medium text-slate-700">{viewingAppointment.details?.condition || 'No specific condition noted.'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Next Steps / Notes</p>
                  <p className="text-sm font-medium text-slate-700">{viewingAppointment.details?.nextSteps || 'No follow-up notes available.'}</p>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button
                  onClick={() => {
                    setEditingAppointment(viewingAppointment);
                    setIsModalOpen(true);
                    setViewingAppointment(null);
                  }}
                  className="flex-1 bg-[#2e8b8b] hover:bg-[#236a6a] text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center space-x-2"
                >
                  <Pencil size={18} />
                  <span>Edit Appointment</span>
                </button>
                <button
                  onClick={() => setViewingAppointment(null)}
                  className="px-6 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
