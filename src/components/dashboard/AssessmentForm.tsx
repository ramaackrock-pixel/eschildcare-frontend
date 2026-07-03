import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Save,
  Activity,
  HeartPulse,
  Syringe,
  Baby
} from 'lucide-react';

interface AssessmentFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function AssessmentForm({ onSave, onCancel }: AssessmentFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vitals: {
      weight: '',
      height: '',
      temperature: '',
      headCircumference: '',
      spo2: ''
    },
    clinical: {
      currentSymptoms: '',
      growthAndDevelopment: '',
      vaccinationHistory: '',
      physicalExamination: '',
      planAndPrescription: ''
    }
  });

  const handleUpdate = (section: keyof typeof formData, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 border-b pb-4">
          <Baby className="text-primary" />
          Paediatric Clinical Assessment
        </h3>

        <div className="space-y-8">
          {/* Vitals Section */}
          <div>
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-4">
              <HeartPulse size={16} className="text-pink-500" /> Vitals & Measurements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight (kg)</label>
                <input
                  type="text"
                  value={formData.vitals.weight}
                  onChange={(e) => handleUpdate('vitals', 'weight', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                  placeholder="e.g. 12.5"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Height (cm)</label>
                <input
                  type="text"
                  value={formData.vitals.height}
                  onChange={(e) => handleUpdate('vitals', 'height', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                  placeholder="e.g. 85"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperature</label>
                <input
                  type="text"
                  value={formData.vitals.temperature}
                  onChange={(e) => handleUpdate('vitals', 'temperature', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                  placeholder="e.g. 98.6 F"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Head Circum. (cm)</label>
                <input
                  type="text"
                  value={formData.vitals.headCircumference}
                  onChange={(e) => handleUpdate('vitals', 'headCircumference', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                  placeholder="e.g. 48"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">SpO2 (%)</label>
                <input
                  type="text"
                  value={formData.vitals.spo2}
                  onChange={(e) => handleUpdate('vitals', 'spo2', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                  placeholder="e.g. 98"
                />
              </div>
            </div>
          </div>

          {/* Clinical Details */}
          <div>
             <h4 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Activity size={16} className="text-blue-500" /> Clinical History & Exam
            </h4>
            <div className="space-y-4">
               <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Symptoms / Illness</label>
                <textarea
                  value={formData.clinical.currentSymptoms}
                  onChange={(e) => handleUpdate('clinical', 'currentSymptoms', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                  rows={2}
                  placeholder="Describe main complaints..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth and Development Notes</label>
                <textarea
                  value={formData.clinical.growthAndDevelopment}
                  onChange={(e) => handleUpdate('clinical', 'growthAndDevelopment', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                  rows={2}
                  placeholder="Milestones, diet, etc."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Syringe size={12}/> Vaccination History
                </label>
                <textarea
                  value={formData.clinical.vaccinationHistory}
                  onChange={(e) => handleUpdate('clinical', 'vaccinationHistory', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                  rows={2}
                  placeholder="Up to date? Pending vaccines?"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">General Physical Examination</label>
                <textarea
                  value={formData.clinical.physicalExamination}
                  onChange={(e) => handleUpdate('clinical', 'physicalExamination', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                  rows={3}
                  placeholder="Systemic exam findings..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-primary">Treatment Plan & Prescription</label>
                <textarea
                  value={formData.clinical.planAndPrescription}
                  onChange={(e) => handleUpdate('clinical', 'planAndPrescription', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                  rows={3}
                  placeholder="Medications, advice, follow-up..."
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-40">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-2xl flex items-center justify-between">
          <button onClick={onCancel} className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors">Discard</button>
          <button
            onClick={() => onSave(formData)}
            className="flex items-center space-x-3 px-10 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/80 active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            <Save size={18} />
            <span>Save Assessment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
