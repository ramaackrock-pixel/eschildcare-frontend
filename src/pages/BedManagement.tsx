import { useState, useEffect, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { BedDouble, Plus, Users, UserMinus, Building2, Activity, Info, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { RoomModal } from '@/components/dashboard/RoomModal';
import { admissionService } from '@/services/admissionService';
import toast from 'react-hot-toast';

export function BedManagement() {
  const { user } = useAuth();
  const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin';
  const { patients } = useAppData();

  const [rooms, setRooms] = useState<any[]>([]);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedRooms, fetchedAdmissions] = await Promise.all([
        admissionService.getRooms(),
        admissionService.getAllAdmissions()
      ]);
      setRooms(fetchedRooms || []);
      setAdmissions((fetchedAdmissions || []).filter((a: any) => a.status !== 'DISCHARGED'));
    } catch (error) {
      console.error('Error fetching bed management data', error);
      toast.error('Failed to load bed layout');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveRoom = async (roomsData: any[]) => {
    await Promise.all(roomsData.map(roomData => admissionService.createRoom(roomData)));
    toast.success(`${roomsData.length} bed(s) created successfully`);
    fetchData();
  };

  const handleDeleteRoom = async (roomId: string, roomNumber: string) => {
    if (window.confirm(`Are you sure you want to delete ${roomNumber}? This action cannot be undone.`)) {
      try {
        await admissionService.deleteRoom(roomId);
        toast.success(`${roomNumber} deleted successfully`);
        fetchData();
      } catch (error) {
        toast.error('Failed to delete bed');
      }
    }
  };

  const handleAdmitClick = (room: any) => {
    setSelectedRoom(room);
    setSelectedPatientId('');
    setAdmitModalOpen(true);
  };

  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedRoom) {
      toast.error('Please select a patient');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    const isAlreadyAdmitted = admissions.some(a => {
      const aId = a.patientId?._id || a.patientId?.id || a.patientId;
      return aId === selectedPatientId;
    });
    
    if (isAlreadyAdmitted) {
      toast.error(`${patient.name} is already admitted to a bed. Please discharge them first.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await admissionService.admit({
        patientId: patient.id,
        patientName: patient.name,
        roomNumber: selectedRoom.number,
        department: selectedRoom.department,
        attendingDoctor: patient.assignedDoctor || patient.consultedBy || 'Unassigned',
      });
      toast.success(`${patient.name} admitted to ${selectedRoom.number}`);
      setAdmitModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to admit patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDischarge = async (roomNumber: string) => {
    const admission = admissions.find(a => a.roomNumber === roomNumber);
    if (!admission) return;

    if (window.confirm(`Are you sure you want to discharge ${admission.patientName}?`)) {
      try {
        await admissionService.discharge(admission._id);
        toast.success(`Patient discharged successfully`);
        fetchData();
      } catch (error) {
        toast.error('Failed to discharge patient');
      }
    }
  };

  const stats = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter(r => r.status === 'OCCUPIED').length;
    const available = total - occupied;
    const occupancyRate = total === 0 ? 0 : Math.round((occupied / total) * 100);
    return { total, occupied, available, occupancyRate };
  }, [rooms]);

  // Group rooms by department
  const groupedRooms = useMemo(() => {
    const groups: Record<string, any[]> = {};
    rooms.forEach(room => {
      const dept = room.department || 'General';
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(room);
    });
    return groups;
  }, [rooms]);

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Bed Management</h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Real-time tracking of ward occupancy and patient admissions.
          </p>
        </div>
        <button
          onClick={() => setIsRoomModalOpen(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>Add New Bed</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Beds</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <BedDouble size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.available}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center space-x-4">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Occupied</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.occupied}</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Occupancy Rate</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.occupancyRate}%</h3>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : Object.keys(groupedRooms).length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BedDouble size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">No Beds Configured</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            There are currently no rooms or beds configured in the system. Use the "Add New Bed" button to start building your ward layout.
          </p>
          <button
            onClick={() => setIsRoomModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold py-2 px-6 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Configure Ward</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedRooms).map(([department, deptRooms]) => (
            <div key={department} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-800">{department}</h3>
                <p className="text-xs font-medium text-slate-500">{deptRooms.length} beds in this section</p>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {deptRooms.map((room) => {
                  const isAvailable = room.status === 'AVAILABLE';
                  const activeAdmission = isAvailable ? null : admissions.find(a => a.roomNumber === room.number);

                  return (
                    <div 
                      key={room.id || room._id} 
                      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                        isAvailable 
                          ? 'border-slate-100 bg-white hover:border-primary/20 hover:shadow-md' 
                          : 'border-rose-100 bg-rose-50/30'
                      }`}
                    >
                      <div className={`h-1.5 w-full ${isAvailable ? 'bg-primary' : 'bg-rose-500'}`} />
                      
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-black text-slate-800 tracking-tight">{room.number}</h4>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600">
                              {room.type}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleDeleteRoom(room.id || room._id, room.number)}
                              className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete Bed"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className={`p-2 rounded-lg ${isAvailable ? 'bg-primary/10 text-primary' : 'bg-rose-50 text-rose-600'}`}>
                              <BedDouble size={20} />
                            </div>
                          </div>
                        </div>

                        {isAvailable ? (
                          <div className="mt-6 flex justify-between items-center">
                            <p className="text-xs font-bold text-slate-400">AVAILABLE</p>
                            <button
                              onClick={() => handleAdmitClick(room)}
                              className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded text-xs font-bold transition-colors shadow-sm"
                            >
                              Assign Patient
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 space-y-3">
                            <div className="flex items-start space-x-2">
                              <UserMinus size={14} className="text-rose-400 mt-0.5 shrink-0" />
                              <p className="text-sm font-bold text-slate-800 leading-tight">
                                {activeAdmission?.patientName || 'Unknown Patient'}
                              </p>
                            </div>
                            {activeAdmission?.attendingDoctor && (
                              <div className="flex items-start space-x-2">
                                <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                                <p className="text-xs font-medium text-slate-500">
                                  Dr. {activeAdmission.attendingDoctor.replace('Dr. ', '')}
                                </p>
                              </div>
                            )}
                            <div className="pt-3 border-t border-rose-100/50 flex justify-between items-center">
                              <p className="text-[10px] font-bold text-rose-500 tracking-wider">OCCUPIED</p>
                              <button
                                onClick={() => handleDischarge(room.number)}
                                className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded text-xs font-bold transition-colors shadow-sm"
                              >
                                Discharge
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSave={handleSaveRoom}
      />

      {/* Admit Patient Modal */}
      {admitModalOpen && selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-primary/10/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <UserMinus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Assign Patient</h2>
                  <p className="text-xs font-medium text-primary">to {selectedRoom.number}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <form id="admitForm" onSubmit={handleAdmitSubmit}>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  required
                >
                  <option value="">-- Choose a patient --</option>
                  {patients
                    .filter(p => !admissions.some(a => {
                      const aId = a.patientId?._id || a.patientId?.id || a.patientId;
                      return aId === p.id;
                    }))
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.pid || p.id})</option>
                  ))}
                </select>
              </form>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setAdmitModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="admitForm"
                disabled={isSubmitting || !selectedPatientId}
                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
