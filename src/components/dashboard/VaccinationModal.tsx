import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Vaccination } from '@/types/vaccination';
import { useAppData } from '@/context/AppDataContext';

interface VaccinationModalProps {
  vaccination: Vaccination | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function VaccinationModal({ vaccination, isOpen, onClose, onSave }: VaccinationModalProps) {
  const { patients } = useAppData();
  
  const [formData, setFormData] = useState<Partial<Vaccination>>({
    patientId: '',
    patientName: '',
    vaccineName: '',
    givenDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    status: 'UPCOMING',
    notes: ''
  });

  useEffect(() => {
    if (vaccination) {
      setFormData({
        ...vaccination,
        givenDate: vaccination.givenDate ? new Date(vaccination.givenDate).toISOString().split('T')[0] : '',
        nextDueDate: vaccination.nextDueDate ? new Date(vaccination.nextDueDate).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        patientId: '',
        patientName: '',
        vaccineName: '',
        givenDate: new Date().toISOString().split('T')[0],
        nextDueDate: '',
        status: 'UPCOMING',
        notes: ''
      });
    }
  }, [vaccination, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    const patient = patients.find(p => p.id === pId);
    if (patient) {
      setFormData(prev => ({ ...prev, patientId: patient.id, patientName: patient.name, patientPid: patient.pid }));
    } else {
      setFormData(prev => ({ ...prev, patientId: '', patientName: '', patientPid: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {vaccination ? 'Edit Vaccination Record' : 'Log New Vaccination'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">Track patient vaccines and automate reminders</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient</label>
            <select
              value={formData.patientId}
              onChange={handlePatientSelect}
              required
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
            >
              <option value="">Select Patient</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.pid || p.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Vaccine Name</label>
            <input
              type="text"
              value={formData.vaccineName}
              onChange={(e) => setFormData({ ...formData, vaccineName: e.target.value })}
              required
              placeholder="e.g. MMR, DTaP, Polio"
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Given Date</label>
              <input
                type="date"
                value={formData.givenDate as string}
                onChange={(e) => setFormData({ ...formData, givenDate: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Next Due Date</label>
              <input
                type="date"
                value={formData.nextDueDate as string}
                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              required
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium"
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium resize-none"
              rows={3}
              placeholder="Any side effects or comments..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl transition-colors"
            >
              <Save size={16} />
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
