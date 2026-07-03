import React, { useState, useEffect, useRef } from 'react';
import { X, Save, User, Mail, Phone, Briefcase, Building2, Calendar, CreditCard, FileText, Upload, Lock } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: any) => void;
  staff?: any;
}

export default function StaffModal({ isOpen, onClose, onSave, staff }: StaffModalProps) {
  const { branches } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'Senior physiotherapist',
    department: 'Physiotherapy',
    branch: branches[0]?.name || '',
    status: 'Active',
    avatar: '',
    scheduleDays: [],
    shift: 'Morning',
    workingMode: 'Full time',
    workingHours: '09:00 AM - 05:00 PM',
    joiningDate: new Date().toISOString().split('T')[0],
    aadharNumber: '',
    degreeCertificate: null as File | string | null,
    photo: null as File | string | null
  });

  const [aadharError, setAadharError] = useState('');
  const [photoError, setPhotoError] = useState('');

  const DAYS = ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su'];

  useEffect(() => {
    if (isOpen) {
      if (staff) {
        setFormData({
          ...staff,
          password: staff.password || '',
          scheduleDays: staff.scheduleDays || [],
          shift: staff.shift || 'Morning',
          workingMode: staff.workingMode || 'Full time',
          workingHours: staff.workingHours || '09:00 AM - 05:00 PM',
          joiningDate: staff.joiningDate || new Date().toISOString().split('T')[0],
          aadharNumber: staff.aadharNumber || '',
          degreeCertificate: staff.degreeCertificate || null,
          photo: staff.avatar || null
        });
      } else {
        setFormData({
          name: '',
          email: '',
          mobile: '',
          password: '',
          role: 'Senior physiotherapist',
          department: 'Physiotherapy',
          branch: branches[0]?.name || '',
          status: 'Active',
          avatar: '',
          scheduleDays: [],
          shift: 'Morning',
          workingMode: 'Full time',
          workingHours: '09:00 AM - 05:00 PM',
          joiningDate: new Date().toISOString().split('T')[0],
          aadharNumber: '',
          degreeCertificate: null,
          photo: null
        });
      }
      setAadharError('');
      setPhotoError('');
    }
  }, [isOpen, branches, staff]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'mobile') {
      const numericValue = value.replace(/[^\d]/g, '').substring(0, 10);
      setFormData((prev: any) => ({ ...prev, [name]: numericValue }));
      return;
    }

    if (name === 'aadharNumber') {
      const numericValue = value.replace(/[^\d]/g, '').substring(0, 12);
      setFormData((prev: any) => ({ ...prev, [name]: numericValue }));
      if (numericValue.length > 0 && numericValue.length < 12) {
        setAadharError('Aadhar number must be 12 digits');
      } else {
        setAadharError('');
      }
      return;
    }

    if (name === 'shift') {
      let hours = formData.workingHours;
      if (value === 'Morning') hours = '09:00 AM - 05:00 PM';
      else if (value === 'Evening') hours = '02:00 PM - 10:00 PM';
      else if (value === 'Night') hours = '10:00 PM - 06:00 AM';

      setFormData((prev: any) => ({ ...prev, shift: value, workingHours: hours }));
      return;
    }

    if (name === 'role') {
      setFormData((prev: any) => ({ ...prev, role: value }));
      return;
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev: any) => ({ ...prev, degreeCertificate: e.target.files![0] }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev: any) => ({ ...prev, photo: e.target.files![0] }));
      setPhotoError('');
    }
  };

  const handleDayToggle = (day: string) => {
    setFormData((prev: any) => {
      const days = prev.scheduleDays || [];
      if (days.includes(day)) {
        return { ...prev, scheduleDays: days.filter((d: string) => d !== day) };
      } else {
        return { ...prev, scheduleDays: [...days, day] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.aadharNumber && formData.aadharNumber.length !== 12) {
      setAadharError('Aadhar number must be 12 digits');
      return;
    }

    if (!staff && !formData.photo) {
      setPhotoError('Profile photo is mandatory');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (['attendanceLogs', 'payrollLogs', 'createdAt', 'updatedAt', '__v', '_id'].includes(key)) {
        return;
      }

      if (key === 'scheduleDays') {
        formData.scheduleDays.forEach((day: string) => data.append('scheduleDays[]', day));
      } else if (key === 'degreeCertificate') {
        if (formData[key] instanceof File) {
          data.append('degreeCertificate', formData[key]);
        } else if (formData[key]) {
          data.append('degreeCertificate', formData[key]);
        }
      } else if (key === 'photo') {
        if (formData[key] instanceof File) {
          data.append('photo', formData[key]);
        } else if (formData[key]) {
          data.append('photo', formData[key]);
        }
      } else {
        data.append(key, formData[key]);
      }
    });

    if (staff && !data.has('id')) {
      data.append('id', staff.id || staff._id);
    }

    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Basic Information</h3>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Profile Photo <span className="text-red-500">*</span></label>
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${photoError ? 'border-red-400' : 'border-slate-200'} border-dashed rounded-xl transition-all group hover:border-primary hover:bg-primary/5 cursor-pointer`}
                >
                  <div className="space-y-1 text-center">
                    <User className={`mx-auto h-10 w-10 text-slate-300 group-hover:text-primary transition-colors`} />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <span className={`relative rounded-md font-bold text-primary hover:text-primary`}>
                        {formData.photo instanceof File ? formData.photo.name :
                          formData.photo ? 'Photo Uploaded' : 'Upload photo'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    className="hidden"
                    onChange={handlePhotoChange}
                    accept="image/*"
                  />
                </div>
                {photoError && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{photoError}</p>}
                {formData.photo && typeof formData.photo === 'string' && (
                  <img src={formData.photo} alt="Profile" className="mt-3 h-16 w-16 object-cover rounded-full border-2 border-primary/20" />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    autoComplete="new-email"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mobile</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="9XXXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Aadhar Number</label>
                <div className="relative">
                  <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    placeholder="12 Digit Aadhar Number"
                    className={`w-full bg-slate-50 border ${aadharError ? 'border-red-400' : 'border-slate-200'} text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all`}
                  />
                </div>
                {aadharError && <p className="text-[10px] text-red-500 font-bold mt-1 uppercase">{aadharError}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Portal Password (For Staff Login)</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter login password"
                    autoComplete="new-password"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase">Default password: defaultpassword123</p>
              </div>
            </div>

            {/* Employment Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Employment Details</h3>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Joining</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  >
                    <option>Senior physiotherapist</option>
                    <option>Junior physiotherapist</option>
                    <option>Clinical physiotherapist</option>
                    <option>Senior Consultant</option>
                    <option>Nurse</option>
                    <option>Admin / Receptionist</option>
                    <option>Lab technician</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  >
                    <option>Physiotherapy</option>
                    <option>Administration</option>
                    <option>Nursing</option>
                    <option>Laboratory</option>
                    <option>Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch</label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  >
                    {branches.map((b: any) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Degree Certificate</label>
                <div
                  onClick={() => !staff && fileInputRef.current?.click()}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl transition-all group ${staff ? 'cursor-not-allowed opacity-60 bg-slate-50' : 'hover:border-primary hover:bg-primary/5 cursor-pointer'}`}
                >
                  <div className="space-y-1 text-center">
                    <Upload className={`mx-auto h-10 w-10 ${staff ? 'text-slate-300' : 'text-slate-300 group-hover:text-primary'} transition-colors`} />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <span className={`relative rounded-md font-bold ${staff ? 'text-slate-500' : 'text-primary hover:text-primary'}`}>
                        {formData.degreeCertificate instanceof File ? formData.degreeCertificate.name :
                          formData.degreeCertificate ? 'Certificate Uploaded' : 'Upload certificate'}
                      </span>
                    </div>
                    {!staff && <p className="text-xs text-slate-400">PDF, PNG, JPG up to 5MB</p>}
                    {staff && <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Cannot be modified after creation</p>}
                  </div>
                  {!staff && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,image/*"
                    />
                  )}
                </div>
                {formData.degreeCertificate && typeof formData.degreeCertificate === 'string' && (
                  <a href={formData.degreeCertificate} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 mt-2 text-[10px] font-bold text-primary hover:underline">
                    <FileText size={12} />
                    <span>View Current Certificate</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Schedule Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Working Days</label>
                <div className="flex items-center gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${formData.scheduleDays?.includes(day)
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Shift</label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  >
                    <option>Morning</option>
                    <option>Evening</option>
                    <option>Night</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mode</label>
                  <select
                    name="workingMode"
                    value={formData.workingMode}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  >
                    <option>Full time</option>
                    <option>Part time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Working Hours</label>
                  <input
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleChange}
                    placeholder="09:00 AM - 05:00 PM"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

        </form>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 p-6 border-t border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-2.5 font-bold text-white bg-primary hover:bg-primary/80 rounded-xl transition-colors text-sm shadow-lg shadow-primary/20"
          >
            <Save size={18} />
            <span>{staff ? 'Save Changes' : 'Add Staff'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


