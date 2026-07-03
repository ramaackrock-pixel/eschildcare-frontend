import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import {
  User,
  UserPlus,
  Search,
  ChevronDown,
  MoreVertical,
  Calendar,
  Clock,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Activity,
  Receipt,
  Lock,
  Pencil,
  Trash2,
  Plus,
  X,
  FileText
} from 'lucide-react';
// import { ChevronUp } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import type { StaffTab, AttendanceStatus, ShiftType } from '../types/staff';
import StaffModal from '@/components/dashboard/StaffModal';
import { useSearch } from '@/context/SearchContext';
import { apiService } from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import { generatePayrollPDF } from '@/utils/pdfGenerator';

export function Staff() {
  const { addStaff, updateStaff, deleteStaff } = useAppData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<StaffTab>('List');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  const handleSaveStaff = (data: any) => {
    if (editingStaff) {
      updateStaff(data);
    } else {
      addStaff(data);
    }
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'List': return <StaffListView onEdit={(staff: any) => { setEditingStaff(staff); setIsModalOpen(true); }} onDelete={(id: string) => { if (confirm('Are you sure you want to delete this staff member?')) deleteStaff(id); }} />;
      case 'Attendance': return <AttendanceView />;
      case 'Schedules': return <SchedulesView onEdit={(staff: any) => { setEditingStaff(staff); setIsModalOpen(true); }} />;
      case 'Payroll': return <PayrollView />;
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Staff</h1>
            <p className="text-slate-500 mt-1">Manage clinic staff and operations</p>
          </div>
          <button
            onClick={() => { setEditingStaff(null); setIsModalOpen(true); }}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary hover:bg-[#4a9f9f] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 group"
          >
            <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Add Staff</span>
          </button>
        </div>

        <StaffModal
          isOpen={isModalOpen}
          staff={editingStaff}
          onClose={() => { setIsModalOpen(false); setEditingStaff(null); }}
          onSave={handleSaveStaff}
        />

        {/* Custom Tabs */}
        <div className="bg-slate-100/50 p-1.5 rounded-2xl inline-flex flex-wrap md:flex-nowrap gap-1 border border-slate-200/50">
          {(['List', 'Attendance', 'Schedules', 'Payroll'] as StaffTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); }}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab
                ? 'bg-white text-primary shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Staff {tab === 'List' ? 'List' : tab}
            </button>
          ))}
        </div>

        {/* Dynamic View */}
        {activeTab === 'Payroll' && user?.role !== 'superadmin' ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Restricted Access</h3>
            <p className="text-slate-500 mt-2">You do not have permission to view payroll information.</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </Layout>
  );
}

function StaffListView({ onEdit, onDelete }: { onEdit: (staff: any) => void, onDelete: (id: string) => void }) {
  const { searchQuery } = useSearch();
  const { staff: allStaff, branches } = useAppData();
  const [localSearch, setLocalSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Role: All');
  const [branchFilter, setBranchFilter] = useState('Branch: All');
  const [modeFilter, setModeFilter] = useState('Mode: All');
  const [shiftFilter, setShiftFilter] = useState('Shift: All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const staff = allStaff.filter(s => {
    const activeSearch = localSearch || searchQuery;
    const matchesSearch = s.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(activeSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(activeSearch.toLowerCase());

    const matchesRole = roleFilter === 'Role: All' || s.role === roleFilter;
    const matchesBranch = branchFilter === 'Branch: All' || s.branch === branchFilter;
    const matchesMode = modeFilter === 'Mode: All' || s.workingMode === modeFilter;
    const matchesShift = shiftFilter === 'Shift: All' || s.shift === shiftFilter;

    return matchesSearch && matchesRole && matchesBranch && matchesMode && matchesShift;
  });

  const totalPages = Math.ceil(staff.length / ITEMS_PER_PAGE) || 1;
  const paginatedStaff = staff.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Filters */}
      <div className="p-4 md:p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
        <div className="flex flex-col md:flex-row flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={localSearch}
              onChange={(e) => { setLocalSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-44 group">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                <option value="Role: All">Role: All</option>
                <option value="Senior therapist">Senior therapist</option>
                <option value="Junior therapist">Junior therapist</option>
                <option value="Senior Consultant">Senior Consultant</option>
                <option value="Nurse">Nurse</option>
                <option value="Admin / Receptionist">Admin / Receptionist</option>
                <option value="Lab technician">Lab technician</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-44 group">
              <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                <option value="Branch: All">Branch: All</option>
                {branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-44 group">
              <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={modeFilter}
                onChange={(e) => { setModeFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                <option value="Mode: All">Mode: All</option>
                <option value="Full time">Full time</option>
                <option value="Part time">Part time</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative w-full sm:w-44 group">
              <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={shiftFilter}
                onChange={(e) => { setShiftFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                <option value="Shift: All">Shift: All</option>
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <button
          onClick={() => { setLocalSearch(''); setRoleFilter('Role: All'); setBranchFilter('Branch: All'); setModeFilter('Mode: All'); setShiftFilter('Shift: All'); setCurrentPage(1); }}
          className="text-primary text-[10px] font-bold uppercase tracking-widest hover:text-primary font-bold flex items-center space-x-2 mt-2 xl:mt-0 whitespace-nowrap"
        >
          <Filter size={14} />
          <span>Clear Filters</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#f2fafa] text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-100">
              <th className="px-6 py-4 whitespace-nowrap">Staff Name</th>
              <th className="px-6 py-4 whitespace-nowrap">Role</th>
              <th className="px-6 py-4 whitespace-nowrap">Mode</th>
              <th className="px-6 py-4 whitespace-nowrap">Shift</th>
              <th className="px-6 py-4 whitespace-nowrap">Department</th>
              <th className="px-6 py-4 whitespace-nowrap">Branch</th>
              <th className="px-6 py-4 whitespace-nowrap">Joining Date</th>
              <th className="px-6 py-4 whitespace-nowrap">Aadhar Number</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Documents</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedStaff.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {member.avatar ? (
                      <img src={member.avatar} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-white shadow-sm ${member.initialsBg || 'bg-primary/10 text-primary'}`}>
                        {member.initials || member.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-800">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${member.role.includes('Senior') ? 'bg-primary/10 text-primary' :
                    member.role.includes('Nurse') ? 'bg-primary/10 text-primary' :
                      member.role.includes('Admin') ? 'bg-slate-50 text-slate-600' :
                        'bg-primary/10 text-primary'
                    }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${member.workingMode === 'Part time' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                    {member.workingMode || 'Full time'}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {member.shift || 'Morning'}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600 font-medium whitespace-nowrap">{member.department}</td>
                <td className="px-6 py-5 text-sm text-slate-600 font-medium whitespace-nowrap">{member.branch}</td>
                <td className="px-6 py-5 text-sm text-slate-600 font-bold whitespace-nowrap">{member.joiningDate || '-'}</td>
                <td className="px-6 py-5 text-sm text-slate-500 font-medium tracking-wider whitespace-nowrap">{member.aadharNumber || '-'}</td>
                <td className="px-6 py-5 text-center whitespace-nowrap">
                  {member.degreeCertificate ? (
                    <a
                      href={member.degreeCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-[9px] font-black text-primary hover:underline uppercase"
                    >
                      <FileText size={10} />
                      <span>Certificate</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 text-[9px] font-bold uppercase tracking-tighter">No Files</span>
                  )}
                </td>
                <td className="px-6 py-5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-2">
                    <button onClick={() => onEdit(member)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(member.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400">Showing {paginatedStaff.length} of {staff.length} staff members</p>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-slate-600 font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Time Calculation Utilities
const parseTimeToMinutes = (timeStr: string | undefined): number | null => {
  if (!timeStr) return null;
  const clean = timeStr.trim().toUpperCase();
  
  // Match 12-hour AM/PM format (e.g. "09:30 AM", "9:30 PM", "9:30AM")
  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const period = ampmMatch[3];
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  
  // Match 24-hour format (e.g. "18:00", "09:30", "09:30:00")
  const militaryMatch = clean.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (militaryMatch) {
    const hours = parseInt(militaryMatch[1], 10);
    const minutes = parseInt(militaryMatch[2], 10);
    return hours * 60 + minutes;
  }
  
  return null;
};

const getShiftTimings = (workingHours: string | undefined) => {
  let startStr = "09:00 AM";
  let endStr = "06:00 PM";
  
  if (workingHours && workingHours.includes('-')) {
    const parts = workingHours.split('-');
    if (parts.length === 2) {
      const s = parts[0].trim();
      const e = parts[1].trim();
      if (parseTimeToMinutes(s) !== null) startStr = s;
      if (parseTimeToMinutes(e) !== null) endStr = e;
    }
  }
  return { startStr, endStr };
};

const calculateLateMinutes = (checkInStr: string | undefined, shiftStartStr: string): number => {
  if (!checkInStr) return 0;
  const checkInMin = parseTimeToMinutes(checkInStr);
  const shiftStartMin = parseTimeToMinutes(shiftStartStr);
  
  if (checkInMin === null || shiftStartMin === null) return 0;
  return Math.max(0, checkInMin - shiftStartMin);
};

const calculateOTMinutes = (
  checkInStr: string | undefined,
  checkOutStr: string | undefined,
  shiftStartStr: string,
  shiftEndStr: string
): number => {
  if (!checkInStr || !checkOutStr) return 0;
  
  const checkInMin = parseTimeToMinutes(checkInStr);
  const checkOutMin = parseTimeToMinutes(checkOutStr);
  const shiftStartMin = parseTimeToMinutes(shiftStartStr);
  const shiftEndMin = parseTimeToMinutes(shiftEndStr);
  
  if (checkInMin === null || checkOutMin === null || shiftStartMin === null || shiftEndMin === null) {
    return 0;
  }
  
  const lateMin = Math.max(0, checkInMin - shiftStartMin);
  const extraAfterShift = Math.max(0, checkOutMin - shiftEndMin);
  
  return Math.max(0, extraAfterShift - lateMin);
};

function EditAttendanceModal({ isOpen, onClose, log, member, onSave }: any) {
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (isOpen && log) {
      setCheckInTime(log.checkInTime || '');
      setCheckOutTime(log.checkOutTime || '');
      setStatus(log.status || 'checked in');
      setLocation(log.location || '');
    }
  }, [isOpen, log]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...log,
      checkInTime: checkInTime.trim(),
      checkOutTime: checkOutTime.trim() || undefined,
      status,
      location: location.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Attendance Log</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{member?.name} • {log?.date}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check In Time</label>
            <input
              type="text"
              required
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              placeholder="e.g. 09:30 AM"
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium animate-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Check Out Time</label>
            <input
              type="text"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              placeholder="e.g. 06:00 PM (Leave empty if only checked in)"
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium"
            >
              <option value="checked in">Checked In</option>
              <option value="presented today">Presented Today</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. GPS Coordinates or Office Location"
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 font-bold text-white bg-primary hover:bg-primary/80 rounded-xl transition-colors text-sm shadow-lg shadow-primary/20"
            >
              Save Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExportMonthlyExcelModal({ isOpen, onClose, staff, branches }: any) {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  const [selectedBranch, setSelectedBranch] = useState('All');

  if (!isOpen) return null;

  const handleExport = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const targetMonth = `${yearStr}-${monthStr}`;
    
    const filteredStaff = staff.filter((s: any) => selectedBranch === 'All' || s.branch === selectedBranch);
    
    const summaryData: any[] = [];
    const detailsData: any[] = [];

    filteredStaff.forEach((member: any) => {
      const monthlyLogs = (member.attendanceLogs || []).filter((log: any) => log.date.startsWith(targetMonth));
      const daysPresent = monthlyLogs.length;

      const { startStr: shiftStart, endStr: shiftEnd } = getShiftTimings(member.workingHours);

      let totalLateMin = 0;
      let totalOTMin = 0;
      let totalWorkedMin = 0;

      monthlyLogs.forEach((log: any) => {
        const late = calculateLateMinutes(log.checkInTime, shiftStart);
        const ot = calculateOTMinutes(log.checkInTime, log.checkOutTime, shiftStart, shiftEnd);
        
        let workedMin = 0;
        if (log.checkInTime && log.checkOutTime) {
          const inMin = parseTimeToMinutes(log.checkInTime);
          const outMin = parseTimeToMinutes(log.checkOutTime);
          if (inMin !== null && outMin !== null && outMin >= inMin) {
            workedMin = outMin - inMin;
          }
        }

        totalLateMin += late;
        totalOTMin += ot;
        totalWorkedMin += workedMin;

        detailsData.push({
          'Staff Name': member.name,
          'Email': member.email,
          'Branch': member.branch,
          'Date': log.date,
          'Shift': member.shift || 'Morning',
          'Working Hours Set': member.workingHours || '09:00 AM - 05:00 PM',
          'Check In': log.checkInTime || '--',
          'Check Out': log.checkOutTime || '--',
          'Worked Hours': workedMin > 0 ? `${Math.floor(workedMin / 60)}h ${workedMin % 60}m` : '--',
          'Late (Mins)': late,
          'OT (Mins)': ot,
          'Status': log.status || 'N/A',
          'Location Details': log.location || '--'
        });
      });

      summaryData.push({
        'Staff Name': member.name,
        'Email': member.email,
        'Role': member.role,
        'Branch': member.branch,
        'Working Hours Shift': member.workingHours || '09:00 AM - 05:00 PM',
        'Days Present': daysPresent,
        'Total Worked Hours': `${Math.floor(totalWorkedMin / 60)}h ${totalWorkedMin % 60}m`,
        'Total Late (Mins)': totalLateMin,
        'Total Late (Hours)': (totalLateMin / 60).toFixed(1),
        'Total OT (Mins)': totalOTMin,
        'Total OT (Hours)': (totalOTMin / 60).toFixed(1)
      });
    });

    try {
      const wb = XLSX.utils.book_new();
      
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      const wsDetails = XLSX.utils.json_to_sheet(detailsData);

      const autofitColumns = (ws: any) => {
        if (!ws['!ref']) return;
        const range = XLSX.utils.decode_range(ws['!ref']);
        const cols = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          let maxLen = 10;
          for (let row = range.s.r; row <= range.e.r; row++) {
            const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
            if (cell && cell.v) {
              const valLen = String(cell.v).length;
              if (valLen > maxLen) maxLen = valLen;
            }
          }
          cols.push({ wch: maxLen + 3 });
        }
        ws['!cols'] = cols;
      };

      autofitColumns(wsSummary);
      autofitColumns(wsDetails);

      XLSX.utils.book_append_sheet(wb, wsSummary, 'Monthly Summary');
      XLSX.utils.book_append_sheet(wb, wsDetails, 'Daily Logs Details');

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      
      const fileMonthName = new Date(Number(yearStr), Number(monthStr) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
      saveAs(dataBlob, `Staff_Attendance_Report_${fileMonthName.replace(' ', '_')}.xlsx`);
      
      onClose();
    } catch (e: any) {
      console.error(e);
      alert('Error generating Excel file: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Export Attendance Report</h2>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Download monthly attendance as Excel</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filter by Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-semibold"
            >
              <option value="All">All Branches</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/10 flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Download Excel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceView() {
  const { staff: allStaff, updateStaff, branches } = useAppData();
  const todayStr = new Date().toLocaleDateString('en-CA');
  const [dateFilter, setDateFilter] = useState(todayStr);
  const [branchFilter, setBranchFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const calculateDuration = (inTime: string | undefined, outTime: string | undefined) => {
    if (!inTime || !outTime) return '--';
    try {
      const inMinutes = parseTimeToMinutes(inTime);
      const outMinutes = parseTimeToMinutes(outTime);
      if (inMinutes === null || outMinutes === null) return '--';
      const diff = outMinutes - inMinutes;

      if (diff < 0) return '--';

      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return `${h}h ${m}m`;
    } catch (e) {
      return '--';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'presented today': return 'bg-primary/10 text-primary border-primary/20';
      case 'checked in': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };



  const handleDeleteLog = (member: any) => {
    if (confirm(`Are you sure you want to remove attendance for ${dateFilter}?`)) {
      const logs = (member.attendanceLogs || []).filter((l: any) => l.date !== dateFilter);
      updateStaff({ ...member, attendanceLogs: logs });
    }
  };

  const handleOpenEditModal = (member: any, log: any) => {
    setSelectedMember(member);
    setSelectedLog(log);
    setIsEditModalOpen(true);
  };

  const handleSaveEditedLog = (updatedLog: any) => {
    const logs = [...(selectedMember.attendanceLogs || [])];
    const idx = logs.findIndex((l: any) => l.date === updatedLog.date);
    if (idx > -1) {
      logs[idx] = updatedLog;
      updateStaff({ ...selectedMember, attendanceLogs: logs });
    }
    setIsEditModalOpen(false);
  };

  const filteredStaff = allStaff.filter(s => branchFilter === 'All' || s.branch === branchFilter);

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE) || 1;
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* Modals */}
      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        log={selectedLog}
        member={selectedMember}
        onSave={handleSaveEditedLog}
      />
      <ExportMonthlyExcelModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        staff={allStaff}
        branches={branches}
      />

      {/* Attendance Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-56 group">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              max={todayStr}
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <div className="relative w-full sm:w-64 group">
            <div className="relative">
              <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value); setCurrentPage(1); }}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none cursor-pointer transition-all"
              >
                <option value="All">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none bg-white" />
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Download size={16} />
          <span>Export Monthly Excel</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-50">
              <th className="px-6 py-4 whitespace-nowrap">Staff Name</th>
              <th className="px-6 py-4 whitespace-nowrap">Shift Setup</th>
              <th className="px-6 py-4 whitespace-nowrap">Status</th>
              <th className="px-6 py-4 whitespace-nowrap">In / Out</th>
              <th className="px-6 py-4 text-center font-bold text-red-500 whitespace-nowrap">Late Login</th>
              <th className="px-6 py-4 text-center font-bold text-emerald-600 whitespace-nowrap">OT Time</th>
              <th className="px-6 py-4 whitespace-nowrap">Worked Hours</th>
              <th className="px-6 py-4 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginatedStaff.map((member) => {
              const dayLog = (member.attendanceLogs || []).find((l: any) => l.date === dateFilter);
              const status = dayLog ? dayLog.status : 'not checked in yet';

              const { startStr: shiftStart, endStr: shiftEnd } = getShiftTimings(member.workingHours);
              const lateMinutes = dayLog ? calculateLateMinutes(dayLog.checkInTime, shiftStart) : 0;
              const otMinutes = dayLog ? calculateOTMinutes(dayLog.checkInTime, dayLog.checkOutTime, shiftStart, shiftEnd) : 0;

              return (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-all font-medium">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img src={member.avatar || undefined} alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{member.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-600 font-bold">{member.shift || 'Morning'}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{member.workingHours || '09:00 AM - 05:00 PM'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold ${getStatusBadge(status)}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${status === 'presented today' ? 'bg-primary' :
                        status === 'checked in' ? 'bg-blue-400' : 'bg-slate-400'
                        }`} />
                      <span>{status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{dayLog?.checkInTime || '--'}</span>
                      {dayLog?.checkOutTime && (
                        <span className="text-[10px] font-bold text-slate-400">Out: {dayLog.checkOutTime}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center whitespace-nowrap">
                    {lateMinutes > 0 ? (
                      <span className="inline-flex px-2 py-1 rounded bg-red-50 text-red-600 text-xs font-black">
                        {lateMinutes} mins
                      </span>
                    ) : dayLog?.checkInTime ? (
                      <span className="text-slate-300 text-xs font-bold">-</span>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center whitespace-nowrap">
                    {otMinutes > 0 ? (
                      <span className="inline-flex px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-xs font-black">
                        +{otMinutes} mins
                      </span>
                    ) : dayLog?.checkInTime ? (
                      <span className="text-slate-300 text-xs font-bold">-</span>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm font-bold">
                    {dayLog?.checkInTime && dayLog?.checkOutTime ? calculateDuration(dayLog.checkInTime, dayLog.checkOutTime) : '--'}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-2">
                      {dateFilter <= todayStr && member.role !== 'Admin / Receptionist' && member.role !== 'admin' && member.role !== 'superadmin' && dayLog && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(member, dayLog)}
                            className="p-2 bg-slate-50 text-slate-500 hover:bg-slate-200 rounded-full transition-all shadow-sm"
                            title="Edit Times"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteLog(member)}
                            className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all shadow-sm"
                            title="Remove Log"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-400">Showing {paginatedStaff.length} of {filteredStaff.length} staff members</p>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-600 font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}

function SchedulesView({ onEdit }: { onEdit: (staff: any) => void }) {
  const { staff: allStaff } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const getShiftBadge = (shift: string | undefined) => {
    switch (shift) {
      case 'Morning': return 'bg-primary/10 text-primary';
      case 'Evening': return 'bg-slate-100 text-slate-600';
      case 'Night': return 'bg-blue-50 text-blue-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const filteredStaff = allStaff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE) || 1;
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-50 bg-slate-50/10 flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:w-80 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff member..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
          />
        </div>

      </div>

      <div className="p-4 space-y-4">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-[#94a3b8] font-bold border-b border-slate-50">
              <th className="px-6 py-4 whitespace-nowrap">Staff Name</th>
              <th className="px-6 py-4 whitespace-nowrap">Shift</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Working Hours</th>
              <th className="px-6 py-4 whitespace-nowrap">Assigned Branch</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Days</th>
              <th className="px-6 py-4 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/50">
            {paginatedStaff.map((sch) => (
              <tr key={sch.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-6 py-6">
                  <div className="flex items-center space-x-3">
                    <img src={sch.avatar || undefined} alt="" className="w-10 h-10 rounded-xl shadow-lg object-cover ring-2 ring-white" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{sch.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{sch.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-bold ${getShiftBadge(sch.shift)}`}>
                    <div className={`w-1 h-1 rounded-full ${sch.shift === 'Morning' ? 'bg-primary' :
                      sch.shift === 'Night' ? 'bg-blue-400' : 'bg-slate-400'
                      }`} />
                    <span>{sch.shift || 'Not Assigned'}</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-sm font-bold text-slate-700 text-center">{sch.workingHours || '-'}</td>
                <td className="px-6 py-6 text-sm text-slate-500 font-medium">{sch.branch}</td>
                <td className="px-6 py-6">
                  <div className="flex items-center justify-center space-x-1.5">
                    {['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'].map((day, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${(sch.scheduleDays || []).includes(day) ? 'bg-[#134e4a] text-white' : 'bg-slate-100 text-slate-300'
                          }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <button onClick={() => onEdit(sch)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400">Showing {paginatedStaff.length} of {filteredStaff.length} staff members</p>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-slate-600 font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function PayrollView() {
  const { staff: allStaff, updateStaff } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const ITEMS_PER_PAGE = 10;

  const today = new Date();
  const [currentMonthStr, setCurrentMonthStr] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);

  const getMonthName = (yyyy_mm: string) => {
    const [y, m] = yyyy_mm.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const filteredStaff = allStaff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const payrollData = filteredStaff.map(member => {
    const log = (member.payrollLogs || []).find((l: any) => l.month === currentMonthStr);
    if (!log) return null;
    return { ...member, ...log };
  }).filter(Boolean);

  const totalPages = Math.ceil(payrollData.length / ITEMS_PER_PAGE) || 1;
  const paginatedPayroll = payrollData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPayroll = payrollData.reduce((acc: any, curr: any) => acc + curr.netPay, 0);

  const handleExportPDF = (member: any) => {
    generatePayrollPDF(member, getMonthName(currentMonthStr));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <AddPayrollModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentMonth={currentMonthStr}
        staff={allStaff}
        updateStaff={updateStaff}
      />
      {/* Header Filters */}
      <div className="p-4 md:p-6 border-b border-slate-50 bg-slate-50/10 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-56 group">
            <input
              type="month"
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none cursor-pointer"
              value={currentMonthStr}
              onChange={(e) => { setCurrentMonthStr(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="relative w-full lg:w-64 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary/10 hover:bg-primary/10 text-primary px-6 py-2.5 rounded-xl border border-primary/20 text-xs font-bold transition-all shadow-sm">
          <Plus size={16} />
          <span>Add Payroll</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-[#94a3b8] font-bold border-b border-slate-50">
              <th className="px-8 py-4 whitespace-nowrap">Staff Name</th>
              <th className="px-6 py-4 text-center whitespace-nowrap">Days Present</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Salary</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Deductions</th>
              <th className="px-6 py-4 text-right whitespace-nowrap">Bonus</th>
              <th className="px-6 py-4 text-right px-8 whitespace-nowrap">Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/50">
            {paginatedPayroll.map((rec: any) => (
              <tr key={rec.id} onClick={() => handleExportPDF(rec)} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-3">
                    <img src={rec.avatar || undefined} alt="" className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-white" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{rec.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{rec.role}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-slate-700 text-center">{rec.daysPresent}</td>
                <td className="px-6 py-5 text-sm font-bold text-slate-700 text-right">
                  ₹{rec.salary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-sm font-bold text-red-400 text-right">
                  -₹{rec.deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-sm font-bold text-primary text-right">
                  ₹{rec.bonus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-8 py-5 text-sm font-bold text-slate-800 text-right group-hover:text-[#134e4a]">
                  ₹{rec.netPay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {payrollData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center text-slate-500 font-medium">
                  No payroll data found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400">Showing {paginatedPayroll.length} of {payrollData.length} records</p>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-slate-600 font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Monthly Total */}
      <div className="p-8 border-t-2 border-dashed border-slate-100 flex items-center justify-end space-x-8 bg-slate-50/20">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Total:</p>
        <h4 className="text-3xl font-black text-[#134e4a]">₹{totalPayroll.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
      </div>
    </div>
  );
}

function AddPayrollModal({ isOpen, onClose, currentMonth, staff, updateStaff }: any) {
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [formData, setFormData] = useState({
    daysPresent: '' as number | string,
    salary: '' as number | string,
    deductions: '' as number | string,
    bonus: '' as number | string
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedStaffId('');
      setFormData({ daysPresent: '', salary: '', deductions: '', bonus: '' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedStaffId) {
      const member = staff.find((s: any) => s.id === selectedStaffId);
      if (member) {
        // Calculate unique days present in the selected month
        const currentMonthLogs = (member.attendanceLogs || []).filter((l: any) => l.date.startsWith(currentMonth));
        const uniqueDays = [...new Set(currentMonthLogs.map((l: any) => l.date))].length;
        setFormData(prev => ({ ...prev, daysPresent: uniqueDays || '' }));
      }
    }
  }, [selectedStaffId, staff, currentMonth]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member = staff.find((s: any) => s.id === selectedStaffId);
    if (!member) return;

    const newLog = {
      month: currentMonth,
      daysPresent: Number(formData.daysPresent),
      salary: Number(formData.salary),
      deductions: Number(formData.deductions),
      bonus: Number(formData.bonus),
      netPay: Number(formData.salary) - Number(formData.deductions) + Number(formData.bonus)
    };

    const logs = [...(member.payrollLogs || [])];
    const existingIdx = logs.findIndex((l: any) => l.month === currentMonth);
    if (existingIdx > -1) {
      logs[existingIdx] = newLog;
    } else {
      logs.push(newLog);
    }

    updateStaff({ ...member, payrollLogs: logs });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Add Payroll Record</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Staff Member</label>
            <select
              required
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium"
            >
              <option value="" disabled>Select a staff member</option>
              {staff.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Days Present</label>
              <input
                type="number"
                min="0"
                required
                value={formData.daysPresent}
                onChange={(e) => setFormData(prev => ({ ...prev, daysPresent: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Base Salary</label>
              <input
                type="number"
                min="0"
                required
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Deductions</label>
              <input
                type="number"
                min="0"
                required
                value={formData.deductions}
                onChange={(e) => setFormData(prev => ({ ...prev, deductions: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bonus</label>
              <input
                type="number"
                min="0"
                required
                value={formData.bonus}
                onChange={(e) => setFormData(prev => ({ ...prev, bonus: e.target.value === '' ? '' : Number(e.target.value) }))}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase">Net Pay</p>
            <p className="text-xl font-black text-primary">₹{(Number(formData.salary) - Number(formData.deductions) + Number(formData.bonus)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 font-bold text-white bg-primary hover:bg-primary/80 rounded-xl transition-colors text-sm shadow-lg shadow-primary/20"
            >
              Save Payroll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BarChart({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}



function ChevronUp({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}
