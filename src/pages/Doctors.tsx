import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Award, User } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useAppData } from '@/context/AppDataContext';
import DoctorModal from '@/components/dashboard/DoctorModal';
import type { Doctor } from '@/types/doctor';

export function Doctors() {
  const { doctors, addDoctor, updateDoctor, deleteDoctor } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveDoctor = (data: Partial<Doctor>) => {
    if (selectedDoctor) {
      updateDoctor({ ...selectedDoctor, ...data } as Doctor);
    } else {
      const newDoctor: Doctor = {
        ...data,
        id: `DOC-${Math.floor(Math.random() * 10000)}`,
      } as Doctor;
      addDoctor(newDoctor);
    }
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      deleteDoctor(id);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Doctors Management</h1>
            <p className="text-slate-500 mt-1">Add and manage medical professionals</p>
          </div>
          <button 
            onClick={() => { setSelectedDoctor(null); setIsModalOpen(true); }}
            className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            <span>Add Doctor</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
          </div>

          {filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
              {filteredDoctors.map((doctor) => (
                <div key={doctor.id} className="bg-white rounded-3xl p-6 border border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <div className={`w-2 h-2 rounded-full ${doctor.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                  </div>

                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-white shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        {doctor.avatar ? (
                          <img src={doctor.avatar} alt={doctor.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-3xl font-bold ${doctor.initialsBg || 'bg-primary/10 text-primary'}`}>
                            {doctor.initials || doctor.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md">
                        <div className="p-1.5 bg-primary text-white rounded-lg">
                          <Award size={14} />
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800">{doctor.name}</h3>
                    <p className="text-sm font-bold text-primary uppercase tracking-wider mt-1">{doctor.specialization}</p>
                  </div>
                  
                  <div className="space-y-4 mb-8 bg-slate-50/50 p-4 rounded-2xl">
                    <div className="flex items-center space-x-3 text-sm text-slate-600">
                      <Mail size={16} className="text-slate-400" />
                      <span className="truncate">{doctor.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-slate-600">
                      <Phone size={16} className="text-slate-400" />
                      <span>{doctor.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-slate-600">
                      <Award size={16} className="text-slate-400" />
                      <span className="font-bold text-slate-500">{doctor.experience} experience</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleEdit(doctor)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-primary hover:text-white transition-all group/btn"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(doctor.id)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-all group/btn"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No doctors found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search or add a new doctor.</p>
            </div>
          )}
        </div>

        <DoctorModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedDoctor(null); }}
          onSave={handleSaveDoctor}
          doctor={selectedDoctor}
        />
      </div>
    </Layout>
  );
}
