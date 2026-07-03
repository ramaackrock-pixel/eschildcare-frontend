import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { X, Save, Clock, User, Building2, Calendar } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import type { Appointment } from '@/types/appointment';

interface AppointmentModalProps {
  appointment?: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: any) => void;
}

export default function AppointmentModal({ appointment, isOpen, onClose, onSave }: AppointmentModalProps) {
  const { patients, doctors, branches, staff } = useAppData();

  const convertTo24Hour = (time12?: string) => {
    if (!time12) return '09:00';
    if (!time12.includes(' ')) return time12;
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours, 10) + 12);
    if (modifier === 'AM' && hours === '12') hours = '00';
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const [formData, setFormData] = useState<any>({
    time: '09:00',
    duration: '45 mins',
    appointmentDate: new Date().toISOString().split('T')[0],
    patientName: '',
    patientId: '',
    therapists: [],
    doctorId: '',
    doctorName: '',
    branch: '',
    sessionType: 'Initial Consult',
    status: 'PENDING',
    details: {
      phone: '',
      email: '',
      lastVisit: '',
      condition: '',
      nextSteps: ''
    }
  });

  useEffect(() => {
    if (appointment) {
      const dateStr = appointment.appointmentDate || (appointment as any).date;
      const formattedDate = dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';
      setFormData({ ...appointment, appointmentDate: formattedDate, time: convertTo24Hour(appointment.time) });
    } else {
      setFormData({
        time: '09:00',
        duration: '45 mins',
        appointmentDate: new Date().toISOString().split('T')[0],
        patientName: '',
        patientId: '',
        therapists: [],
        doctorId: '',
        doctorName: '',
        branch: '',
        sessionType: 'Initial Consult',
        status: 'PENDING',
        details: {
          phone: '',
          email: '',
          lastVisit: '',
          condition: '',
          nextSteps: ''
        }
      });
    }
  }, [appointment, isOpen, doctors]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('details.')) {
      const field = name.split('.')[1];
      setFormData((prev: any) => ({
        ...prev,
        details: { ...prev.details, [field]: value }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const removeTherapist = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      therapists: (prev.therapists || []).filter((t: any) => t.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctorId && (!formData.therapists || formData.therapists.length === 0)) {
      alert("Please select at least one Doctor or Therapist.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {appointment ? 'Edit Appointment' : 'Book New Appointment'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Patient</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Select
                  options={patients.map(p => ({ value: p.name, label: `${p.name} (${p.pid || p.id})`, patient: p }))}
                  value={formData.patientName ? { value: formData.patientName, label: `${formData.patientName} (${patients.find((p: any) => p.id === formData.patientId)?.pid || formData.patientId || ''})` } : null}
                  onChange={(selectedOption: any) => {
                    const patientName = selectedOption ? selectedOption.value : '';
                    const patient = selectedOption ? selectedOption.patient : null;
                    if (patient) {
                      setFormData((prev: any) => ({
                        ...prev,
                        patientName,
                        patientId: patient.id,
                        details: {
                          ...prev.details,
                          phone: patient.contact,
                          lastVisit: patient.lastVisit
                        }
                      }));
                    } else {
                      setFormData((prev: any) => ({ ...prev, patientName: '', patientId: '' }));
                    }
                  }}
                  placeholder="Search and select a patient..."
                  className="text-sm font-medium"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: '#f8fafc',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      paddingLeft: '28px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#cbd5e1'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 100
                    })
                  }}
                  maxMenuHeight={200}
                  isClearable
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="45 mins"
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                required
              />
            </div>


            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Doctor</label>
              <Select
                options={doctors.map(d => ({ value: d.name, label: `${d.name} (${d.specialization})`, doctor: d }))}
                value={formData.doctorName ? { value: formData.doctorName, label: `${formData.doctorName} (${doctors.find((d: any) => d.id === formData.doctorId)?.specialization || 'Doctor'})` } : null}
                onChange={(selectedOption: any) => {
                  const doctorName = selectedOption ? selectedOption.value : '';
                  const doctor = selectedOption ? selectedOption.doctor : null;
                  if (doctor) {
                    setFormData((prev: any) => ({ ...prev, doctorName, doctorId: doctor.id }));
                  } else {
                    setFormData((prev: any) => ({ ...prev, doctorName: '', doctorId: '' }));
                  }
                }}
                placeholder="Select Doctor (Optional)"
                isClearable
                className="text-sm font-medium"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#f8fafc',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#cbd5e1' }
                  }),
                  menu: (base) => ({ ...base, zIndex: 100 })
                }}
                maxMenuHeight={200}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Therapists (Max 2)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.therapists || []).map((t: any) => (
                  <span key={t.id} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold">
                    {t.name}
                    <button type="button" onClick={() => removeTherapist(t.id)} className="hover:text-primary"><X size={12} /></button>
                  </span>
                ))}
              </div>
              {(!formData.therapists || formData.therapists.length < 2) && (
                <Select
                  options={staff.filter(s => s.role?.toLowerCase().includes('therapist')).map(s => ({ value: s.name, label: `${s.name} (${s.role})`, staff: s }))}
                  value={null}
                  onChange={(selectedOption: any) => {
                    const therapistName = selectedOption ? selectedOption.value : '';
                    if (!therapistName) return;
                    if (formData.therapists?.length >= 2) {
                      alert("Maximum 2 therapists can be selected");
                      return;
                    }
                    if (formData.therapists?.find((t: any) => t.name === therapistName)) return;
                    const therapist = selectedOption.staff;
                    if (therapist) {
                      setFormData((prev: any) => ({
                        ...prev,
                        therapists: [...(prev.therapists || []), { id: therapist.id, name: therapist.name }]
                      }));
                    }
                  }}
                  placeholder="Add Therapist..."
                  className="text-sm font-medium"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: '#f8fafc',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#cbd5e1' }
                    }),
                    menu: (base) => ({ ...base, zIndex: 100 })
                  }}
                  maxMenuHeight={200}
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Select
                  options={branches.map(b => ({ value: b.name, label: b.name }))}
                  value={formData.branch ? { value: formData.branch, label: formData.branch } : null}
                  onChange={(selectedOption: any) => {
                    setFormData((prev: any) => ({ ...prev, branch: selectedOption ? selectedOption.value : '' }));
                  }}
                  placeholder="Select Branch"
                  className="text-sm font-medium"
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: '#f8fafc',
                      borderColor: '#e2e8f0',
                      borderRadius: '0.5rem',
                      paddingLeft: '28px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#cbd5e1' }
                    }),
                    menu: (base) => ({ ...base, zIndex: 100 })
                  }}
                  maxMenuHeight={200}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Session Type</label>
              <Select
                options={[
                  { value: 'Initial Consult', label: 'Initial Consult' },
                  { value: 'Follow-up', label: 'Follow-up' },
                  { value: 'Treatment', label: 'Treatment' },
                  { value: 'Assessment', label: 'Assessment' }
                ]}
                value={formData.sessionType ? { value: formData.sessionType, label: formData.sessionType } : null}
                onChange={(selectedOption: any) => {
                  setFormData((prev: any) => ({ ...prev, sessionType: selectedOption ? selectedOption.value : 'Initial Consult' }));
                }}
                className="text-sm font-medium"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#f8fafc',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#cbd5e1' }
                  }),
                  menu: (base) => ({ ...base, zIndex: 100 })
                }}
                maxMenuHeight={200}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
              <Select
                options={[
                  { value: 'PENDING', label: 'PENDING' },
                  { value: 'CONFIRMED', label: 'CONFIRMED' },
                  ...(appointment ? [
                    { value: 'COMPLETED', label: 'COMPLETED' },
                    { value: 'CANCELLED', label: 'CANCELLED' }
                  ] : [])
                ]}
                value={formData.status ? { value: formData.status, label: formData.status } : null}
                onChange={(selectedOption: any) => {
                  setFormData((prev: any) => ({ ...prev, status: selectedOption ? selectedOption.value : 'PENDING' }));
                }}
                className="text-sm font-medium"
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: '#f8fafc',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#cbd5e1' }
                  }),
                  menu: (base) => ({ ...base, zIndex: 100 })
                }}
                maxMenuHeight={200}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Condition Details</label>
              <textarea
                name="details.condition"
                value={formData.details.condition}
                onChange={handleChange}
                rows={2}
                placeholder="Patient complains of lower back pain..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Next Steps / Notes</label>
              <textarea
                name="details.nextSteps"
                value={formData.details.nextSteps}
                onChange={handleChange}
                rows={2}
                placeholder="Schedule follow-up in 2 weeks..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-8 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 font-bold text-white bg-primary hover:bg-primary/80 rounded-xl transition-colors text-sm shadow-lg shadow-primary/20"
            >
              <Save size={18} />
              <span>{appointment ? 'Update Appointment' : 'Book Appointment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
