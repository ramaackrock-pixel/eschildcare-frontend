import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { X, Save, User, CreditCard, Building2, Pill } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import type { InvoiceStatus } from '@/types/billing';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: any) => void;
  initialData?: any;
}

export default function InvoiceModal({ isOpen, onClose, onSave, initialData }: InvoiceModalProps) {
  const { patients, branches, services, packages } = useAppData();
  const [activeTab, setActiveTab] = useState<'billing' | 'medicines'>('billing');
  const [formData, setFormData] = useState<any>({
    patientId: '',
    patientName: '',
    consultingFee: '',
    otherCharges: '',
    fareBreakdown: [],
    medicines: [],
    totalAmount: '',
    discount: '',
    paidAmount: '',
    status: 'PENDING' as InvoiceStatus,
    branch: branches[0]?.name || '',
    paymentMode: 'Cash',
    brace: '',
    nutraceutical: '',
    lab: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : (initialData.createdAt ? new Date(initialData.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
        });
      } else {
        setFormData({
          patientName: '',
          billingType: '',
          service: '',
          subService: '',
          packageCategory: '',
          sessions: '',
          consultingFee: '',
          otherCharges: '',
          fareBreakdown: [],
          medicines: [],
          totalAmount: '',
          discount: '',
          paidAmount: '',
          status: 'PAID',
          branch: branches[0]?.name || '',
          paymentMode: 'Cash',
          brace: '',
          nutraceutical: '',
          lab: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [isOpen, initialData, branches]);

  useEffect(() => {
    setFormData((prev: any) => {
      const medicineTotal = (prev.medicines || []).reduce((sum: number, med: any) => sum + (Number(med.price) || 0), 0);
      const breakdownTotal = (prev.fareBreakdown || []).reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0);
      const newTotal = (Number(prev.consultingFee) || 0) + (Number(prev.otherCharges) || 0) + medicineTotal + breakdownTotal;
      return {
        ...prev,
        totalAmount: newTotal || '',
        paidAmount: newTotal ? Math.max(0, newTotal - (Number(prev.discount) || 0)) : ''
      };
    });
  }, [formData.consultingFee, formData.otherCharges, formData.medicines, formData.fareBreakdown, formData.discount]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: (name === 'consultingFee' || name === 'otherCharges' || name === 'paidAmount' || name === 'discount') ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleAddMedicine = () => {
    setFormData((prev: any) => ({
      ...prev,
      medicines: [...(prev.medicines || []), { name: '', morning: '', afternoon: '', evening: '', night: '', timing: 'After Food', quantity: '', price: '' }]
    }));
  };

  const handleMedicineChange = (index: number, field: string, value: string | number) => {
    setFormData((prev: any) => {
      const newMeds = [...(prev.medicines || [])];
      newMeds[index] = { ...newMeds[index], [field]: value };
      return { ...prev, medicines: newMeds };
    });
  };

  const handleRemoveMedicine = (index: number) => {
    setFormData((prev: any) => {
      const newMeds = [...(prev.medicines || [])];
      newMeds.splice(index, 1);
      return { ...prev, medicines: newMeds };
    });
  };

  const handleAddBreakdown = () => {
    setFormData((prev: any) => ({
      ...prev,
      fareBreakdown: [...(prev.fareBreakdown || []), { item: '', amount: '' }]
    }));
  };

  const handleBreakdownChange = (index: number, field: string, value: string | number) => {
    setFormData((prev: any) => {
      const newBreakdown = [...(prev.fareBreakdown || [])];
      newBreakdown[index] = { ...newBreakdown[index], [field]: value };
      return { ...prev, fareBreakdown: newBreakdown };
    });
  };

  const handleRemoveBreakdown = (index: number) => {
    setFormData((prev: any) => {
      const newBreakdown = [...(prev.fareBreakdown || [])];
      newBreakdown.splice(index, 1);
      return { ...prev, fareBreakdown: newBreakdown };
    });
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      service: value,
      subService: '' // Reset sub-service
    }));
  };

  const handleTypeChange = (type: 'SERVICE' | 'PACKAGE') => {
    setFormData((prev: any) => ({
      ...prev,
      billingType: type,
      totalAmount: type === 'SERVICE' ? 500 : 35000,
      paidAmount: type === 'SERVICE' ? 500 : 35000,
      service: '',
      subService: '',
      packageCategory: '',
      sessions: ''
    }));
  };

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      packageCategory: value,
      sessions: '' // Reset sessions
    }));
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setFormData((prev: any) => ({
        ...prev,
        patientId: patient.id,
        patientName: patient.name
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const selectedServiceObj = services ? services.find((s: any) => s.category === formData.service) : null;
  const availableSubServices = selectedServiceObj ? selectedServiceObj.subServices : [];

  const selectedPackageObj = packages ? packages.find((p: any) => p.name === formData.packageCategory) : null;
  const availableSessions = selectedPackageObj ? selectedPackageObj.sessions : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{initialData ? 'Edit Invoice' : 'Create New Invoice'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-slate-50 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'billing' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <div className="flex justify-center items-center space-x-2">
              <CreditCard size={16} />
              <span>Billing Details</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('medicines')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'medicines' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <div className="flex justify-center items-center space-x-2">
              <Pill size={16} />
              <span>Medicines {formData.medicines.length > 0 && `(${formData.medicines.length})`}</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">

            {activeTab === 'billing' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Patient</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                    <Select
                      options={patients.map(p => ({ value: p.id, label: `${p.name} (${p.pid || p.id})`, patient: p }))}
                      value={formData.patientId ? { value: formData.patientId, label: `${formData.patientName} (${patients.find((p: any) => p.id === formData.patientId)?.pid || formData.patientId})` } : null}
                      onChange={(selectedOption: any) => {
                        const patient = selectedOption ? selectedOption.patient : null;
                        if (patient) {
                          setFormData((prev: any) => ({
                            ...prev,
                            patientId: patient.id,
                            patientName: patient.name
                          }));
                        } else {
                          setFormData((prev: any) => ({ ...prev, patientId: '', patientName: '' }));
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



                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Billing Date (DD/MM/YYYY)</label>
                    <DatePicker
                      selected={formData.date ? new Date(formData.date) : null}
                      onChange={(date: Date | null) => {
                        if (date) {
                          const tzOffset = date.getTimezoneOffset() * 60000;
                          const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().split('T')[0];
                          handleChange({ target: { name: 'date', value: localISOTime } } as any);
                        } else {
                          handleChange({ target: { name: 'date', value: '' } } as any);
                        }
                      }}
                      dateFormat="dd/MM/yyyy"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                      placeholderText="DD/MM/YYYY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Consulting Fee (₹)</label>
                    <div className="relative">
                      <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        name="consultingFee"
                        value={formData.consultingFee}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                      />
                    </div>
                  </div>
                  <div className="hidden">
                    {/* Removed Other Charges */}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700 tracking-tight">Fare Breakdown</label>
                    <button type="button" onClick={handleAddBreakdown} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">+ Add Item</button>
                  </div>
                  {formData.fareBreakdown?.map((item: any, index: number) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input type="text" placeholder="e.g. Consultation, Scan" value={item.item} onChange={(e) => handleBreakdownChange(index, 'item', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors" />
                      </div>
                      <div className="w-32">
                        <input type="number" placeholder="Amount (₹)" value={item.amount} onChange={(e) => handleBreakdownChange(index, 'amount', e.target.value === '' ? '' : (Number(e.target.value) || 0))} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors" />
                      </div>
                      <button type="button" onClick={() => handleRemoveBreakdown(index)} className="mt-1 text-slate-400 hover:text-red-500 p-2 rounded-lg transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Mode</label>
                    <select
                      name="paymentMode"
                      value={formData.paymentMode}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                    >
                      <option value="Cash">Cash</option>
                      <option value="GPay">GPay</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                    >
                      <option value="PAID">PAID</option>
                      <option value="PENDING">PENDING</option>
                      <option value="PARTIALLY PAID">PARTIAL</option>
                      <option value="OVERDUE">OVERDUE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Branch</label>
                    <div className="relative">
                      <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Brace</label>
                    <input
                      type="text"
                      name="brace"
                      value={formData.brace}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                      placeholder="e.g. Knee brace"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nutraceutical</label>
                    <input
                      type="text"
                      name="nutraceutical"
                      value={formData.nutraceutical}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                      placeholder="e.g. Vitamins"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lab</label>
                    <input
                      type="text"
                      name="lab"
                      value={formData.lab}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-medium transition-all"
                      placeholder="e.g. Blood test"
                    />
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'medicines' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-700 tracking-tight">Prescribed Medicines</label>
                  <button type="button" onClick={handleAddMedicine} className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg shadow-sm hover:bg-primary/90 transition-colors">+ Add Medicine</button>
                </div>

                <div className="space-y-3">
                  {formData.medicines.map((med: any, index: number) => (
                    <div key={index} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3 relative">
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Medicine Name</label>
                          <input type="text" placeholder="e.g. Paracetamol" value={med.name} onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <button type="button" onClick={() => handleRemoveMedicine(index)} className="mt-5 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-lg transition-colors">
                          <X size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 sm:col-span-5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Dosage (M-A-E-N)</label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">M</span>
                              <input type="text" placeholder="1" value={med.morning} onChange={(e) => handleMedicineChange(index, 'morning', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg pl-6 pr-2 py-2 focus:outline-none focus:border-primary transition-colors text-center font-medium" />
                            </div>
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">A</span>
                              <input type="text" placeholder="0" value={med.afternoon} onChange={(e) => handleMedicineChange(index, 'afternoon', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg pl-6 pr-2 py-2 focus:outline-none focus:border-primary transition-colors text-center font-medium" />
                            </div>
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">E</span>
                              <input type="text" placeholder="1/2" value={med.evening} onChange={(e) => handleMedicineChange(index, 'evening', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg pl-6 pr-2 py-2 focus:outline-none focus:border-primary transition-colors text-center font-medium" />
                            </div>
                            <div className="relative flex-1">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">N</span>
                              <input type="text" placeholder="1" value={med.night} onChange={(e) => handleMedicineChange(index, 'night', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg pl-6 pr-2 py-2 focus:outline-none focus:border-primary transition-colors text-center font-medium" />
                            </div>
                          </div>
                        </div>
                        <div className="col-span-4 sm:col-span-3">
                          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Timing</label>
                          <select value={med.timing} onChange={(e) => handleMedicineChange(index, 'timing', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-primary transition-colors font-medium">
                            <option value="After Food">After Food</option>
                            <option value="Before Food">Before Food</option>
                          </select>
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Qty (No.)</label>
                          <input type="text" placeholder="10" value={med.quantity} onChange={(e) => handleMedicineChange(index, 'quantity', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-primary transition-colors text-center font-medium" />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Price (₹)</label>
                          <input type="number" placeholder="0" value={med.price} onChange={(e) => handleMedicineChange(index, 'price', e.target.value === '' ? '' : (Number(e.target.value) || 0))} className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-primary transition-colors font-medium" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.medicines.length === 0 && (
                    <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-xl">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Pill size={20} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-500 mb-1">No medicines prescribed</p>
                      <p className="text-xs text-slate-400">Click the button above to add medicines.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>



          <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex flex-col text-xs font-bold text-slate-600 uppercase tracking-wider w-full sm:w-auto mb-3 sm:mb-0">
              <span className="text-primary">Breakdown Total: ₹{(formData.fareBreakdown || []).reduce((sum: number, item: any) => sum + (Number(item.amount) || 0), 0)}</span>
              <span className="text-primary mt-1">Medicine Charges: ₹{(formData.medicines || []).reduce((sum: number, med: any) => sum + (Number(med.price) || 0), 0)}</span>
              <span className="text-primary mt-1 text-sm">Total Amount: ₹{formData.totalAmount}</span>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
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
                <span>{initialData ? 'Update Invoice' : 'Create Invoice'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
