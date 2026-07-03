import { useState, useEffect } from 'react';
import { X, Save, ArrowRight, Activity, Heart } from 'lucide-react';
import type { Patient } from '../../types/patient';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { AssessmentForm } from './AssessmentForm';
import { PelvicAssessmentForm } from './PelvicAssessmentForm';

const TagInput = ({ label, placeholder, tags = [], onChange, colorClass }: { label: string, placeholder: string, tags?: string[], onChange: (tags: string[]) => void, colorClass: string }) => {
  const [input, setInput] = useState(tags.join(', '));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const parsedTags = val.split(',').map(s => s.trim()).filter(Boolean);
    onChange(parsedTags);
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all mb-2"
      />
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${colorClass}`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

interface EditPatientProps {
  patient: Patient | null;
  allPatients: Patient[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function EditPatient({ patient, allPatients, isOpen, onClose, onSave }: EditPatientProps) {
  const { user } = useAuth();
  const { branches, doctors } = useAppData();
  const isStaff = user?.role === 'staff';

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    id: '',
    contact: '',
    age: '',
    gender: 'Male',
    branch: '',
    status: 'ACTIVE',
    consultedBy: doctors[0]?.name || '',
    lastVisit: new Date().toLocaleDateString('en-US'),
    assessmentType: 'GENERAL',
    address: '',
    source: '',
    diseases: [],
    conditions: [],
    assignments: [],
    whatsappConsent: true
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      setFormData({
        ...patient,
        assessmentType: patient.assessmentType || 'GENERAL'
      });
      setStep(1);
    } else {
      setFormData({
        name: '',
        pid: '', // Will be generated once branch is selected
        id: '',
        contact: '',
        age: '',
        gender: 'Male',
        branch: '',
        status: 'ACTIVE',
        consultedBy: doctors[0]?.name || 'Dr. Elias Thorne',
        lastVisit: new Date().toISOString().split('T')[0],
        assessmentType: 'GENERAL',
        address: '',
        source: '',
        diseases: [],
        conditions: [],
        assignments: [],
        whatsappConsent: true
      });
      setStep(1);
    }
    setError(null);
  }, [patient, isOpen, branches, doctors]);

  useEffect(() => {
    // Generate consecutive ID for NEW patients based on date
    if (!patient && isOpen) {
      const date = formData.lastVisit ? new Date(formData.lastVisit) : new Date();
      if (isNaN(date.getTime())) return;

      const yy = String(date.getFullYear()).slice(-2);
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const prefix = `ES-${yy}-${mm}-`;

      // Find patients matching this prefix
      const matchingPatients = allPatients.filter(p => p.pid && p.pid.startsWith(prefix));

      // Find the highest sequence number
      let maxSeq = 0;
      matchingPatients.forEach(p => {
        if (p.pid) {
          const parts = p.pid.split('-');
          if (parts.length >= 4) {
            const seqStr = parts[parts.length - 1];
            const seq = parseInt(seqStr, 10);
            if (!isNaN(seq) && seq > maxSeq) {
              maxSeq = seq;
            }
          }
        }
      });

      const nextSeq = maxSeq + 1;
      const formattedSeq = String(nextSeq).padStart(3, '0');
      const generatedId = `${prefix}${formattedSeq}`;

      setFormData(prev => ({ ...prev, pid: generatedId }));
    }
  }, [formData.lastVisit, patient, isOpen, allPatients]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      (e.keyCode >= 35 && e.keyCode <= 39)) {
      return;
    }
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      const numericValue = value.replace(/[^\d]/g, '').substring(0, 10);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
      setError(null);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.contact && formData.contact.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setStep(2);
  };

  const handleFinalSave = (assessmentData: any) => {
    const finalData = {
      ...formData,
      assessmentData
    };
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-2xl w-full ${step === 2 ? 'max-w-4xl' : 'max-w-2xl'} max-h-[95vh] overflow-y-auto shadow-xl transition-all duration-500`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              {patient ? 'Edit Patient Record' : 'Register New Patient'}
            </h2>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
              {step === 1 ? 'Step 1: Administrative Details' : `Step 2: Paediatric Clinical Assessment`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">Select Case Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, assessmentType: 'PAEDIATRIC' }))}
                    className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${formData.assessmentType === 'PAEDIATRIC' || formData.assessmentType === 'GENERAL' || !formData.assessmentType ? 'border-primary bg-white shadow-lg' : 'border-transparent bg-slate-100 opacity-60'}`}
                  >
                    <Activity className={formData.assessmentType === 'PAEDIATRIC' || formData.assessmentType === 'GENERAL' || !formData.assessmentType ? 'text-primary' : 'text-slate-400'} size={24} />
                    <span className="text-xs font-bold mt-2">Paediatric Assessment</span>
                  </button>
                  {/* 
                    <button 
                      type="button"
                      onClick={() => setFormData(p => ({...p, assessmentType: 'PELVIC_FLOOR'}))}
                      className={`flex-1 flex flex-col items-center p-4 rounded-xl border-2 transition-all ${formData.assessmentType === 'PELVIC_FLOOR' ? 'border-pink-500 bg-white shadow-lg' : 'border-transparent bg-slate-100 opacity-60'}`}
                    >
                      <Heart className={formData.assessmentType === 'PELVIC_FLOOR' ? 'text-pink-500' : 'text-slate-400'} size={24} />
                      <span className="text-xs font-bold mt-2">Pelvic Floor</span>
                    </button>
                    */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient ID (Auto-generated)</label>
                  <input
                    type="text"
                    name="pid"
                    value={formData.pid || ''}
                    onChange={handleChange}
                    placeholder="Auto-generated from date"
                    className="w-full bg-slate-100 border border-slate-200 text-primary text-sm rounded-lg px-4 py-2.5 focus:outline-none font-bold transition-all"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact || ''}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="9XXXXXXXXX"
                    className={`w-full bg-slate-50 border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none font-medium transition-all`}
                    required
                  />
                  {error && (
                    <p className="mt-1.5 text-xs font-bold text-red-500 flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        name="age"
                        value={formData.age || ''}
                        onChange={handleChange}
                        placeholder="e.g. 5"
                        className="w-1/2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                        required
                      />
                      <select
                        name="ageUnit"
                        value={formData.ageUnit || 'Yrs'}
                        onChange={handleChange}
                        className="w-1/2 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                      >
                        <option value="Yrs">Yrs</option>
                        <option value="Months">Months</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender || 'Male'}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all appearance-none cursor-pointer"
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned Doctor</label>
                  <select
                    name="consultedBy"
                    value={formData.consultedBy || ''}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.name}>{doc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinic Branch</label>
                  <select
                    name="branch"
                    value={formData.branch || ''}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                    required
                  >
                    <option value="">Select Branch</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registration / Last Visit</label>
                  <input
                    type="date"
                    name="lastVisit"
                    value={formData.lastVisit || ''}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    placeholder="123 Main St, City"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reference / Source</label>
                  <input
                    type="text"
                    name="source"
                    value={formData.source || ''}
                    onChange={handleChange}
                    placeholder="Walk-in, Referral, Google, etc."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient Status</label>
                  <select
                    name="status"
                    value={formData.status || 'ACTIVE'}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                    required
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="DISCHARGED">DISCHARGED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Last Visit</label>
                  <input
                    type="date"
                    name="lastVisit"
                    value={(() => {
                      if (!formData.lastVisit) return '';
                      try {
                        const d = new Date(formData.lastVisit);
                        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
                      } catch {
                        return '';
                      }
                    })()}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6">Clinical Background</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <TagInput
                    label="Diseases"
                    placeholder="Type & press Enter"
                    tags={formData.diseases}
                    onChange={(tags) => setFormData(p => ({ ...p, diseases: tags }))}
                    colorClass="bg-red-50 text-red-600 border border-red-100"
                  />
                  <TagInput
                    label="Conditions"
                    placeholder="Type & press Enter"
                    tags={formData.conditions}
                    onChange={(tags) => setFormData(p => ({ ...p, conditions: tags }))}
                    colorClass="bg-blue-50 text-blue-600 border border-blue-100"
                  />
                  <TagInput
                    label="Assignments"
                    placeholder="Type & press Enter"
                    tags={formData.assignments}
                    onChange={(tags) => setFormData(p => ({ ...p, assignments: tags }))}
                    colorClass="bg-primary/10 text-primary border border-primary/20"
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-700">WhatsApp Communications</h3>
                  <p className="text-xs text-slate-500 mt-1">Receive automated appointment reminders and campaigns.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.whatsappConsent !== false}
                    onChange={(e) => setFormData(p => ({ ...p, whatsappConsent: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-8 border-t border-slate-100">
                <button type="button" onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancel</button>
                {patient && (
                  <button type="button" onClick={() => {
                    if (formData.contact && formData.contact.length !== 10) {
                      setError('Phone number must be exactly 10 digits.');
                      return;
                    }
                    onSave(formData);
                  }} className="w-full sm:w-auto px-6 py-2.5 font-bold text-white bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors text-sm">Quick Save</button>
                )}
                <button type="submit" className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-2.5 font-bold text-white bg-primary hover:bg-primary/80 rounded-xl transition-colors text-sm shadow-lg shadow-primary/20 group">
                  <span>Proceed to Assessment</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          ) : (
            <AssessmentForm onSave={handleFinalSave} onCancel={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}