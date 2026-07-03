import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  User, 
  Activity, 
  ClipboardList, 
  Stethoscope, 
  Target,
  AlertCircle,
  FileText,
  Heart
} from 'lucide-react';

interface PelvicAssessmentFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function PelvicAssessmentForm({ onSave, onCancel }: PelvicAssessmentFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    subjective: {
      chiefComplaint: '',
      progression: '',
      onset: '',
      dateOfInjury: '',
      duration: '',
      qualityOfPain: 'Aching',
      intensity: '0',
      location: '',
      aggravatingFactor: '',
      easingFactor: '',
    },
    redFlags: {
      infection: 'No',
      weightLoss: 'No',
      bleeding: 'No',
      vaginalDischarge: 'No',
    },
    functions: {
      bladder: { frequency: '', urgency: 'No', incontinence: 'No', nocturia: '', pads: '0' },
      bowel: { frequency: '', consistency: 'Normal', straining: 'No', incontinence: 'No', constipation: 'No' },
      sexual: { dyspareunia: 'No', orgasm: 'Normal', lubricant: 'No', moisturizer: 'No' },
      functional: { adls: '', work: '', lifting: '', sitting: '', walking: '' },
      fluidIntake: '',
    },
    history: {
      pregnancies: '',
      complications: '',
      precautions: '',
      transvaginalClearance: 'Pending',
      surgeriesMeds: '',
      previousTreatment: '',
      hormoneTherapy: 'No',
      exercise: '',
    },
    objective: {
      postural: { lumbarLordosis: 'Normal', pelvicAlignment: 'Neutral', ribcageAlignment: 'Neutral', breathingPattern: 'Diaphragmatic' },
      breathing: { diaphragmMobility: 'Good', coordination: 'Normal', paradoxical: 'No' },
      musculoskeletal: { lumbarRom: 'Full', hipRom: 'Full', coreStrength: '', abdominalActivation: '', diastasisRecti: 'No' },
      neurological: { sensation: 'Normal', reflexes: 'Normal', pudendalNerve: 'Normal' },
    },
    examination: {
      external: { skinCondition: 'Normal', scar: 'None', pelvicSymmetry: 'Symmetrical', tenderness: 'None', perinealDescent: 'Normal' },
      internal: { 
        consent: 'No',
        tone: '', 
        tenderness: '', 
        triggerPoints: '', 
        strength: '0', 
        prolapse: 'None', 
        endurance: '', 
        repetition: '', 
        quickContractions: '', 
        coordination: '' 
      },
    },
    diagnosis: {
      clinicalDiagnosis: '',
      planOfCare: '',
      goal: '',
      intervention: '',
      homeExercise: '',
      frequency: '',
      followUps: '',
    }
  });

  const steps = [
    { id: 1, name: 'Subjective & Pain', icon: <User size={18} /> },
    { id: 2, name: 'Bladder/Bowel/Sexual', icon: <Activity size={18} /> },
    { id: 3, name: 'Medical History', icon: <FileText size={18} /> },
    { id: 4, name: 'Objective Testing', icon: <Stethoscope size={18} /> },
    { id: 5, name: 'Pelvic Examination', icon: <Heart size={18} /> },
    { id: 6, name: 'Diagnosis & Plan', icon: <Target size={18} /> },
  ];

  const handleNestedChange = (section: string, subSection: string | null, field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev } as any;
      if (subSection) {
        newData[section][subSection][field] = value;
      } else {
        newData[section][field] = value;
      }
      return newData;
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">Subjective Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Chief Complaint</label>
                  <textarea 
                    value={formData.subjective.chiefComplaint}
                    onChange={(e) => handleNestedChange('subjective', null, 'chiefComplaint', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none" 
                    rows={2} 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Progression</label>
                  <input type="text" value={formData.subjective.progression} onChange={(e) => handleNestedChange('subjective', null, 'progression', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Onset</label>
                  <input type="text" value={formData.subjective.onset} onChange={(e) => handleNestedChange('subjective', null, 'onset', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-red-50/50 p-8 rounded-3xl border border-red-100 shadow-sm">
              <h3 className="text-lg font-bold text-red-800 mb-6 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500" />
                Red Flags
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['infection', 'weightLoss', 'bleeding', 'vaginalDischarge'].map(field => (
                  <div key={field}>
                    <label className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2 block">{field.replace(/([A-Z])/g, ' $1')}</label>
                    <select 
                      value={(formData.redFlags as any)[field]}
                      onChange={(e) => handleNestedChange('redFlags', null, field, e.target.value)}
                      className="w-full bg-white border border-red-200 rounded-xl p-2 text-sm outline-none text-red-700"
                    >
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Bladder Function</h4>
                <div className="space-y-3">
                   {['frequency', 'urgency', 'incontinence', 'nocturia', 'pads'].map(f => (
                     <div key={f}>
                       <label className="text-[9px] font-bold text-slate-400 uppercase">{f}</label>
                       <input type="text" value={(formData.functions.bladder as any)[f]} onChange={(e) => handleNestedChange('functions', 'bladder', f, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                     </div>
                   ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Bowel Function</h4>
                <div className="space-y-3">
                   {['frequency', 'consistency', 'straining', 'incontinence', 'constipation'].map(f => (
                     <div key={f}>
                       <label className="text-[9px] font-bold text-slate-400 uppercase">{f}</label>
                       <input type="text" value={(formData.functions.bowel as any)[f]} onChange={(e) => handleNestedChange('functions', 'bowel', f, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                     </div>
                   ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Sexual Function</h4>
                <div className="space-y-3">
                   {['dyspareunia', 'orgasm', 'lubricant', 'moisturizer'].map(f => (
                     <div key={f}>
                       <label className="text-[9px] font-bold text-slate-400 uppercase">{f}</label>
                       <select value={(formData.functions.sexual as any)[f]} onChange={(e) => handleNestedChange('functions', 'sexual', f, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none">
                         <option>No</option>
                         <option>Yes</option>
                         <option>Decreased</option>
                         <option>Painful</option>
                       </select>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">Gynecological & Medical History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Pregnancies / Parity</label>
                  <input type="text" value={formData.history.pregnancies} onChange={(e) => handleNestedChange('history', null, 'pregnancies', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Complications</label>
                  <input type="text" value={formData.history.complications} onChange={(e) => handleNestedChange('history', null, 'complications', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Precautions</label>
                  <input type="text" value={formData.history.precautions} onChange={(e) => handleNestedChange('history', null, 'precautions', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Transvaginal Clearance</label>
                  <select value={formData.history.transvaginalClearance} onChange={(e) => handleNestedChange('history', null, 'transvaginalClearance', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none">
                    <option>Pending</option>
                    <option>Cleared</option>
                    <option>Not Cleared</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Surgeries / Medications</label>
                  <textarea value={formData.history.surgeriesMeds} onChange={(e) => handleNestedChange('history', null, 'surgeriesMeds', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none" rows={2} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Previous Treatment</label>
                  <textarea value={formData.history.previousTreatment} onChange={(e) => handleNestedChange('history', null, 'previousTreatment', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none" rows={2} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Hormone Therapy</label>
                  <select value={formData.history.hormoneTherapy} onChange={(e) => handleNestedChange('history', null, 'hormoneTherapy', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none">
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Current Exercise Level</label>
                  <input type="text" value={formData.history.exercise} onChange={(e) => handleNestedChange('history', null, 'exercise', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none" />
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Postural Assessment</h4>
                <div className="space-y-4">
                  {['lumbarLordosis', 'pelvicAlignment', 'ribcageAlignment', 'breathingPattern'].map(f => (
                    <div key={f} className="flex flex-col">
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1">{f.replace(/([A-Z])/g, ' $1')}</label>
                      <input type="text" value={(formData.objective.postural as any)[f]} onChange={(e) => handleNestedChange('objective', 'postural', f, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Breathing & Core</h4>
                <div className="space-y-4">
                  {['diaphragmMobility', 'coordination', 'paradoxical'].map(f => (
                    <div key={f} className="flex flex-col">
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1">{f.replace(/([A-Z])/g, ' $1')}</label>
                      <input type="text" value={(formData.objective.breathing as any)[f]} onChange={(e) => handleNestedChange('objective', 'breathing', f, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm md:col-span-2">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-4">Musculoskeletal & Neurological</h4>
                <div className="grid grid-cols-2 gap-4">
                  {['lumbarRom', 'hipRom', 'coreStrength', 'abdominalActivation', 'diastasisRecti'].map(f => (
                    <div key={f} className="flex flex-col">
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1">{f.replace(/([A-Z])/g, ' $1')}</label>
                      <input type="text" value={(formData.objective.musculoskeletal as any)[f]} onChange={(e) => handleNestedChange('objective', 'musculoskeletal', f, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                    </div>
                  ))}
                  {['sensation', 'reflexes', 'pudendalNerve'].map(f => (
                    <div key={f} className="flex flex-col">
                      <label className="text-[9px] font-bold text-slate-400 uppercase mb-1">{f.replace(/([A-Z])/g, ' $1')}</label>
                      <input type="text" value={(formData.objective.neurological as any)[f]} onChange={(e) => handleNestedChange('objective', 'neurological', f, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
             <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-emerald-900">Internal Pelvic Examination Consent</h3>
                    <p className="text-xs text-emerald-700">Patient must agree to the internal examination procedure.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-emerald-900">I Agree:</span>
                    <div className="flex bg-white rounded-xl p-1 border border-emerald-200">
                      <button onClick={() => handleNestedChange('examination', 'internal', 'consent', 'Yes')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.examination.internal.consent === 'Yes' ? 'bg-emerald-500 text-white' : 'text-emerald-400'}`}>Yes</button>
                      <button onClick={() => handleNestedChange('examination', 'internal', 'consent', 'No')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${formData.examination.internal.consent === 'No' ? 'bg-slate-400 text-white' : 'text-slate-300'}`}>No</button>
                    </div>
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">External Examination</h4>
                  <div className="space-y-4">
                    {['skinCondition', 'scar', 'pelvicSymmetry', 'tenderness', 'perinealDescent'].map(f => (
                      <div key={f} className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-xs font-bold text-slate-600 capitalize">{f.replace(/([A-Z])/g, ' $1')}</span>
                        <input type="text" value={(formData.examination.external as any)[f]} onChange={(e) => handleNestedChange('examination', 'external', f, e.target.value)} className="bg-slate-50 border-none rounded-lg px-3 py-1 text-xs outline-none text-right w-40" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-opacity ${formData.examination.internal.consent !== 'Yes' ? 'opacity-40 pointer-events-none' : ''}`}>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Internal Examination (PER VAGINUM / RECTUM)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {['tone', 'tenderness', 'strength', 'prolapse', 'endurance', 'repetition'].map(f => (
                      <div key={f}>
                        <label className="text-[9px] font-bold text-slate-400 uppercase">{f}</label>
                        <input type="text" value={(formData.examination.internal as any)[f]} onChange={(e) => handleNestedChange('examination', 'internal', f, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
             <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
               <h3 className="text-lg font-bold text-slate-800 mb-6">Clinical Diagnosis & Plan</h3>
               <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Diagnosis</label>
                    <textarea value={formData.diagnosis.clinicalDiagnosis} onChange={(e) => handleNestedChange('diagnosis', null, 'clinicalDiagnosis', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none" rows={3} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 block">Treatment Goal</label>
                      <textarea value={formData.diagnosis.goal} onChange={(e) => handleNestedChange('diagnosis', null, 'goal', e.target.value)} className="w-full bg-emerald-50/30 border border-emerald-100 rounded-2xl p-4 text-sm outline-none" rows={3} />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block">Interventions</label>
                      <textarea value={formData.diagnosis.intervention} onChange={(e) => handleNestedChange('diagnosis', null, 'intervention', e.target.value)} className="w-full bg-blue-50/30 border border-blue-100 rounded-2xl p-4 text-sm outline-none" rows={3} />
                    </div>
                  </div>
               </div>
             </div>
          </div>
        );
      default:
        return <div className="p-20 text-center text-slate-400">Section details coming soon...</div>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#e8718d]" /> {/* Pink for Pelvic Floor */}
        {steps.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center flex-1 cursor-pointer" onClick={() => setStep(s.id)}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${step === s.id ? 'bg-[#e8718d] text-white shadow-lg' : 'bg-slate-50 text-slate-300'}`}>
                {s.icon}
              </div>
              <span className={`text-[9px] font-black uppercase mt-2 text-center transition-colors ${step === s.id ? 'text-[#e8718d]' : 'text-slate-400'}`}>
                {s.name}
              </span>
            </div>
            {idx < steps.length - 1 && <div className="h-[1px] flex-1 bg-slate-100 mx-2" />}
          </React.Fragment>
        ))}
      </div>

      <div className="min-h-[500px]">
        {renderStep()}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-40">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-white/50 shadow-2xl flex items-center justify-between">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="px-6 py-3 font-bold rounded-2xl bg-slate-100 text-slate-600 disabled:opacity-0">Previous</button>
          <div className="flex items-center gap-4">
            <button onClick={onCancel} className="text-slate-400 font-bold px-4">Cancel</button>
            {step === 6 ? (
              <button onClick={() => onSave(formData)} className="px-10 py-3 bg-[#e8718d] text-white font-black rounded-2xl shadow-xl shadow-pink-500/20 hover:bg-[#d65f7c]">Finalize Pelvic Assessment</button>
            ) : (
              <button onClick={() => setStep(s => Math.min(6, s + 1))} className="px-10 py-3 bg-[#e8718d] text-white font-black rounded-2xl shadow-xl shadow-pink-500/20 hover:bg-[#d65f7c]">Continue</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
