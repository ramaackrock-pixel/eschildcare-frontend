import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { X, Save, FileText, User } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import type { MedicalRecordType } from '@/types/medicalRecord';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: any) => void;
}

export default function RecordModal({ isOpen, onClose, onSave }: RecordModalProps) {
  const { patients, doctors, branches } = useAppData();
  const [formData, setFormData] = useState<any>({
    patientName: '',
    pid: '',
    recordType: 'REPORT' as MedicalRecordType,
    fileName: '',
    fileObj: null,
    doctor: '',
    uploadedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    branch: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        patientName: '',
        pid: '',
        recordType: 'REPORT',
        fileName: '',
        fileObj: null,
        doctor: doctors[0]?.name || '',
        uploadedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        branch: ''
      });
    }
  }, [isOpen, doctors]);

  if (!isOpen) return null;

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientName = e.target.value;
    const patient = patients.find(p => p.name === patientName);
    if (patient) {
      setFormData((prev: any) => ({ ...prev, patientName, pid: patient.pid || patient.id, branch: patient.branch }));
    } else {
      setFormData((prev: any) => ({ ...prev, patientName, branch: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileObj) {
      alert("Please select a file to upload.");
      return;
    }
    
    if (formData.fileObj) {
      const data = new FormData();
      data.append('patientName', formData.patientName);
      data.append('pid', formData.pid);
      data.append('recordType', formData.recordType);
      data.append('doctor', formData.doctor);
      data.append('uploadedDate', formData.uploadedDate);
      if (formData.branch) {
        data.append('branch', formData.branch);
      }
      data.append('file', formData.fileObj);
      onSave(data);
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Upload Lab Report / Record</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Patient</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <Select
                  options={patients.map(p => ({ value: p.name, label: `${p.name} (${p.pid || p.id})`, patient: p }))}
                  value={formData.patientName ? { value: formData.patientName, label: `${formData.patientName} (${formData.pid || ''})` } : null}
                  onChange={(selectedOption: any) => {
                    const patientName = selectedOption ? selectedOption.value : '';
                    const patient = selectedOption ? selectedOption.patient : null;
                    if (patient) {
                      setFormData((prev: any) => ({ ...prev, patientName, pid: patient.pid || patient.id, branch: patient.branch }));
                    } else {
                      setFormData((prev: any) => ({ ...prev, patientName: '', branch: '' }));
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Record Type</label>
                <select
                  name="recordType"
                  value={formData.recordType}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                >
                  <option value="REPORT">REPORT / LAB</option>
                  <option value="X-RAY">X-RAY</option>
                  <option value="MRI">MRI</option>
                  <option value="PRESCRIPTION">PRESCRIPTION</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Doctor</label>
                <select
                  name="doctor"
                  value={formData.doctor}
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch</label>
                <select
                  name="branch"
                  value={formData.branch}
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
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Upload File</label>
              <div 
                onClick={() => document.getElementById('record-upload')?.click()}
                className="relative border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <FileText size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700">{formData.fileName || 'Click to select file'}</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, PNG, JPG or DICOM (Max. 10MB)</p>
                </div>
                <input
                  id="record-upload"
                  type="file"
                  accept="image/png, image/jpeg, application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const tempUrl = URL.createObjectURL(file);
                      setFormData((prev: any) => ({ 
                        ...prev, 
                        fileName: file.name,
                        fileObj: file,
                        fileUrl: tempUrl
                      }));
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              <span>Upload Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
