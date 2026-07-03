import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import {
  Users,
  UserPlus,
  Receipt,
  DoorOpen,
  History,
  Plus,
  Search,
  ChevronDown,
  MoreVertical,
  Bed,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import type { AdmittedPatient, Room } from '@/types/admission';

export function AdmittedPatients() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { patients, staff } = useAppData();
  const activeTab = searchParams.get('tab') || 'list';

  // Mock state since it's not in context yet
  const [admittedPatients, setAdmittedPatients] = useState<AdmittedPatient[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const addAdmittedPatient = (patient: AdmittedPatient) => {
    setAdmittedPatients(prev => [...prev, patient]);
  };

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admitted Patients</h1>
            <p className="text-slate-500 mt-1">Manage inpatient occupancy and clinical care</p>
          </div>
          {activeTab === 'list' && (
            <button
              onClick={() => setTab('add')}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary hover:bg-[#4a9f9f] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 group"
            >
              <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
              <span>Admit New Patient</span>
            </button>
          )}
        </div>

        {/* Quick Stats (Optional but premium feel) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-primary/10 text-primary rounded-lg"><Users size={20} /></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Occupied</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{admittedPatients.filter((p: AdmittedPatient) => p.status === 'ADMITTED').length}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Currently Admitted</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DoorOpen size={20} /></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{rooms.filter((r: Room) => r.status === 'AVAILABLE').length}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Rooms Ready</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Receipt size={20} /></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">₹{(admittedPatients.reduce((acc: number, p: AdmittedPatient) => acc + (p.totalFees - p.paidFees), 0) / 1000).toFixed(1)}K</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Unpaid Dues</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><History size={20} /></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Discharged</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{admittedPatients.filter((p: AdmittedPatient) => p.status === 'DISCHARGED').length}</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">This Month</p>
          </div>
        </div>

        {/* Dynamic Content */}
        {activeTab === 'list' && <AdmittedList admittedPatients={admittedPatients.filter((p: AdmittedPatient) => p.status === 'ADMITTED')} />}
        {activeTab === 'add' && <AddAdmission patients={patients} rooms={rooms} staff={staff} onSubmit={addAdmittedPatient} onComplete={() => setTab('list')} />}
        {activeTab === 'fees' && <FeesManagement admittedPatients={admittedPatients} />}
        {activeTab === 'rooms' && <RoomAvailability rooms={rooms} />}
        {activeTab === 'past' && <AdmittedList admittedPatients={admittedPatients.filter((p: AdmittedPatient) => p.status === 'DISCHARGED')} isPast={true} />}
      </div>
    </Layout>
  );
}

function AdmittedList({ admittedPatients, isPast = false }: { admittedPatients: AdmittedPatient[], isPast?: boolean }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by patient or ID..."
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#f8fafc] text-[10px] uppercase font-bold tracking-widest text-slate-500">
            <tr>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Room</th>
              <th className="px-6 py-4">Admitted On</th>
              {isPast && <th className="px-6 py-4">Discharged On</th>}
              <th className="px-6 py-4">Dept / Doctor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {admittedPatients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{p.patientId}</p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-2">
                    <Bed size={14} className="text-primary" />
                    <span className="text-sm font-bold text-slate-700">{p.roomNumber}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-600 font-medium">{p.admissionDate}</td>
                {isPast && <td className="px-6 py-5 text-sm text-slate-600 font-medium">{p.dischargeDate || 'N/A'}</td>}
                <td className="px-6 py-5">
                  <div>
                    <p className="text-sm font-bold text-slate-700">{p.department}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{p.attendingDoctor}</p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${p.status === 'ADMITTED' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddAdmission({ patients, rooms, staff, onSubmit, onComplete }: { patients: any[], rooms: Room[], staff: any[], onSubmit: any, onComplete: () => void }) {
  const [formData, setFormData] = useState({
    patientId: '',
    manualPatientName: '',
    roomNumber: '',
    admissionDate: new Date().toISOString().split('T')[0],
    department: 'Physiotherapy',
    attendingDoctor: '',
    status: 'ADMITTED' as const,
    totalFees: 0,
    paidFees: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let patientName = formData.manualPatientName;
    let patientId = formData.patientId;

    if (formData.patientId && formData.patientId !== 'MANUAL') {
      const patient = patients.find(p => p.id === formData.patientId);
      if (patient) {
        patientName = patient.name;
        patientId = patient.id;
      }
    } else if (formData.patientId === 'MANUAL') {
      patientId = `PT-NEW-${Math.floor(Math.random() * 1000)}`;
    } else {
      return; // No patient selected or entered
    }

    onSubmit({
      ...formData,
      id: `ADM-${Math.floor(Math.random() * 1000)}`,
      patientId,
      patientName
    });
    onComplete();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
      <div className="p-8 border-b border-slate-50 bg-[#f8fafc]">
        <h2 className="text-2xl font-bold text-slate-800">New Admission Form</h2>
        <p className="text-slate-500 text-sm mt-1">Register a patient for inpatient care</p>
      </div>
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Patient Selection</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, patientId: formData.patientId ? '' : 'MANUAL', manualPatientName: '' })}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                {formData.patientId === 'MANUAL' ? 'Select Existed Patient' : 'Register New / Walk-in'}
              </button>
            </div>

            {formData.patientId === 'MANUAL' ? (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold" size={18} />
                <input
                  type="text"
                  placeholder="Enter Patient Full Name..."
                  className="w-full pl-12 pr-4 py-3 bg-primary/5 border border-primary/20 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                  value={formData.manualPatientName}
                  onChange={e => setFormData({ ...formData, manualPatientName: e.target.value })}
                  required
                />
              </div>
            ) : (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <select
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none"
                  value={formData.patientId}
                  onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                  required
                >
                  <option value="">Select Existing Patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id})</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Room Number</label>
            <div className="relative">
              <Bed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none"
                value={formData.roomNumber}
                onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                required
              >
                <option value="">Select Room</option>
                {rooms.filter(r => r.status === 'AVAILABLE').map(r => <option key={r.id} value={r.number}>{r.number} ({r.type})</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Attending Doctor</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none"
                value={formData.attendingDoctor}
                onChange={e => setFormData({ ...formData, attendingDoctor: e.target.value })}
                required
              >
                <option value="">Select Doctor</option>
                {staff.map(s => <option key={s.id} value={s.name}>{s.name} ({s.department})</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Admission Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="date"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                value={formData.admissionDate}
                onChange={e => setFormData({ ...formData, admissionDate: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onComplete}
            className="px-8 py-3 text-slate-500 font-bold hover:text-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary hover:bg-[#4a9f9f] text-white px-10 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 active:scale-95"
          >
            Confirm Admission
          </button>
        </div>
      </form>
    </div>
  );
}

function FeesManagement({ admittedPatients }: { admittedPatients: AdmittedPatient[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-50 bg-slate-50/30">
        <h3 className="font-bold text-slate-800">Inpatient Fee Tracking</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#f8fafc] text-[10px] uppercase font-bold tracking-widest text-slate-500">
            <tr>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Room Dues</th>
              <th className="px-6 py-4">Total Amount</th>
              <th className="px-6 py-4">Paid Amount</th>
              <th className="px-6 py-4">Balance</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {admittedPatients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-5">
                  <p className="text-sm font-bold text-slate-800">{p.patientName}</p>
                </td>
                <td className="px-6 py-5">
                  <p className="text-sm font-medium text-slate-600">Rm {p.roomNumber}</p>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-slate-800">₹{p.totalFees.toLocaleString()}</td>
                <td className="px-6 py-5 text-sm font-bold text-primary">₹{p.paidFees.toLocaleString()}</td>
                <td className="px-6 py-5 text-sm font-bold text-red-500">₹{(p.totalFees - p.paidFees).toLocaleString()}</td>
                <td className="px-6 py-5 text-center">
                  <button className="text-[10px] font-black uppercase bg-primary/10 text-[#2e8b8b] px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-all">
                    Receive Payment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoomAvailability({ rooms }: { rooms: Room[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-in fade-in duration-500">
      {rooms.map(room => (
        <div key={room.id} className={`bg-white p-6 rounded-3xl border ${room.status === 'AVAILABLE' ? 'border-primary/20 shadow-primary/20' : 'border-slate-100 shadow-sm'} group hover:shadow-xl transition-all`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${room.status === 'AVAILABLE' ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400'}`}>
              <Bed size={24} />
            </div>
            <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${room.status === 'AVAILABLE' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}>
              {room.status}
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-800">Room {room.number}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-4">{room.type} • {room.department}</p>

          <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Price / Day</p>
              <p className="text-sm font-black text-slate-800">₹{room.pricePerDay}</p>
            </div>
            {room.status === 'AVAILABLE' ? (
              <CheckCircle2 size={18} className="text-primary" />
            ) : (
              <AlertCircle size={18} className="text-slate-300" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
