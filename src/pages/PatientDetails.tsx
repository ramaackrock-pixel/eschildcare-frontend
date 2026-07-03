import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useAppData } from '@/context/AppDataContext';
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Phone,
  Stethoscope,
  Activity,
  ClipboardList,
  User,
  AlertCircle,
  Pencil,
  FileText,
  Home
} from 'lucide-react';
import EditPatient from '../components/dashboard/EditPatient';
import AppointmentModal from '../components/dashboard/AppointmentModal';
import { apiService } from '@/services/apiService';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { generateAssessmentPDF } from '@/utils/pdfGenerator';

export function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patients, appointments: allAppointments, medicalRecords, invoices: allInvoices, updatePatient, addAppointment } = useAppData();
  const { user } = useAuth();
  const isStaff = user?.role === 'staff';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  const patient = patients.find(p => p.id === id);
  const patientAppointments = allAppointments.filter(a => 
    a.patientName === patient?.name || a.pid === patient?.pid || a.pid === patient?.id || a.patientId === patient?.id
  );
  const patientRecords = (medicalRecords || []).filter(r => 
    r.pid === patient?.id || r.pid === patient?.pid || r.patientName === patient?.name
  );

  // Calculate Live Financial Stats
  const patientInvoices = (allInvoices || []).filter(i => 
    i.pid === patient?.id || i.pid === patient?.pid || i.patientId === patient?.id || i.patientName === patient?.name
  );
  const totalBilled = patientInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalPaid = patientInvoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0);
  const outstanding = totalBilled - totalPaid;

  if (!patient) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle size={48} className="text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Patient Not Found</h2>
          <p className="text-slate-500 mt-2">The patient record you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/patients')}
            className="mt-6 bg-primary text-white px-6 py-2 rounded-lg font-bold"
          >
            Back to Patients
          </button>
        </div>
      </Layout>
    );
  }
  const handleSavePatient = (updatedPatient: any) => {
    updatePatient(updatedPatient);
    setIsEditModalOpen(false);
  };

  const handleSaveAppointment = (appointment: any) => {
    addAppointment({
      ...appointment,
      pid: patient.id
    });
    setIsAppointmentModalOpen(false);
  };

  return (
    <Layout>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                {patient.name}
                <span className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-widest ${patient.statusColor}`}>
                  {patient.status}
                </span>
              </h1>
              <p className="text-sm font-medium text-slate-500">Patient ID: <span className="text-primary font-bold">{patient.pid || patient.id}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Top Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 shadow-inner ${patient.initialsBg}`}>
              {patient.initials}
            </div>
            <h3 className="text-xl font-black text-slate-800">{patient.name}</h3>
            <p className="text-sm font-bold text-primary mb-6">{patient.age} {patient.ageUnit || 'Yrs'}, {patient.gender}</p>

            <div className="w-full space-y-4 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg"><Phone size={14} className="text-slate-400" /></div>
                <span className="font-medium">{patient.contact}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg"><Home size={14} className="text-slate-400" /></div>
                <span className="font-medium text-left truncate">
                  {patient.address || 'No address provided'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg"><MapPin size={14} className="text-slate-400" /></div>
                <span className="font-medium">{patient.branch}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="p-2 bg-slate-50 rounded-lg"><User size={14} className="text-slate-400" /></div>
                <span className="font-medium text-left">Assigned to: {patient.assignedDoctor}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Stethoscope size={14} className="text-primary" />
                  Clinical Diagnoses & History
                </h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {(!patient.diseases?.length && !patient.conditions?.length) && (
                    <span className="text-sm text-slate-400 italic">No clinical diagnoses recorded.</span>
                  )}
                  {patient.diseases?.map((d, i) => (
                    <span key={`disease-${i}`} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                      {d}
                    </span>
                  ))}
                  {patient.conditions?.map((c, i) => (
                    <span key={`condition-${i}`} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ongoing Assignments</h5>
                  {(!patient.assignments || patient.assignments.length === 0) ? (
                    <p className="text-sm text-slate-400 italic mt-1">No ongoing assignments.</p>
                  ) : (
                    <ul className="space-y-2">
                      {patient.assignments.map((a, i) => (
                        <li key={`assignment-${i}`} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>



                {patient.notes && (
                  <div className="mt-6 p-4 bg-primary/10/50 rounded-2xl border border-primary/20/50">
                    <h5 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                      <FileText size={12} />
                      General Notes
                    </h5>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {patient.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    Appointment History
                  </h4>
                  <span className="text-xs font-bold text-slate-400">{patientAppointments.length} Total Visits</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-50">
                      {patientAppointments.length > 0 ? patientAppointments.map((app) => (
                        <tr key={app.id} className="group">
                          <td className="py-4 truncate pr-4">
                            <div className="font-bold text-slate-800 text-sm">{app.sessionType}</div>
                            <div className="text-[10px] text-slate-500">{app.time} • {app.duration}</div>
                          </td>
                          <td className="py-4 text-sm font-medium text-slate-600">
                            {app.therapist}
                          </td>
                          <td className="py-4 text-right">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full ${app.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                              app.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-600' :
                                app.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                                  'bg-slate-100 text-slate-600'
                              }`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-400 text-sm italic">No appointment history found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 space-y-6">
              <div className="bg-slate-800 p-6 rounded-3xl text-white">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Stats</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-xs text-slate-400">Last Visit</span>
                    <span className="font-bold text-sm text-primary">
                      {new Date(patient.lastVisit).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <span className="text-xs text-slate-400">Total Billed</span>
                    <span className="font-bold text-sm">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalBilled)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pb-2">
                    <span className="text-xs text-slate-400">Outstanding</span>
                    <span className={`font-black text-lg ${outstanding > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(outstanding)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FileText size={14} className="text-primary" />
                  Recent Reports
                </h4>
                <div className="space-y-3">
                  {/* Fixed Assessment Button */}
                  <div
                    onClick={() => generateAssessmentPDF(patient)}
                    className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 hover:border-primary transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform"><Stethoscope size={14} className="text-primary" /></div>
                      <div>
                        <div className="text-xs font-bold text-slate-700 truncate max-w-[140px]">Initial Assessment.pdf</div>
                        <div className="text-[10px] text-slate-400">Clinic Report</div>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Activity size={14} className="text-primary animate-pulse" />
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-slate-100 my-2" />

                  {/* Dynamic Records */}
                  {patientRecords.length > 0 ? (
                    patientRecords.slice(0, 3).map(record => (
                      <div
                        key={record.id}
                        onClick={() => {
                          if (record.fileUrl) {
                            window.open(record.fileUrl, '_blank');
                          } else {
                            alert("Document view not available for this record type.");
                          }
                        }}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-transparent rounded-xl hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg group-hover:scale-110 transition-transform">
                            <FileText size={14} className="text-slate-400 group-hover:text-primary" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{record.fileName}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{record.recordType} • {record.uploadedDate}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Medical Records Found</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/records', { state: { searchTerm: patient.name } })}
                  className="w-full mt-6 text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                >
                  Manage All Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditPatient
        patient={patient}
        allPatients={patients}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSavePatient}
      />

      <AppointmentModal
        appointment={null}
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        onSave={handleSaveAppointment}
      />
    </Layout>
  );
}
