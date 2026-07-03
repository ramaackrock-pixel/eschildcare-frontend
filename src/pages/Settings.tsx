import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Building, Lock, ArrowLeft, Save, Database, CheckCircle2, AlertTriangle, LogOut, Trash2 } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings, patients } = useAppData();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [formData, setFormData] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Wipe Data State
  const [wipeConfirmation, setWipeConfirmation] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(resolve => setTimeout(resolve, 800));
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4042/api/v1'}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to change password');
      
      toast.success('Password updated successfully. Logging you out...');
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleWipeData = async () => {
    if (wipeConfirmation !== 'delete in portal') {
      toast.error("Please type exactly 'delete in portal' to confirm.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4042/api/v1'}/admin/wipe-data`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirmationText: wipeConfirmation })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to wipe data');
      
      toast.success('All operational data has been completely wiped from the system.');
      setWipeConfirmation('');
      // Force refresh data if needed
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleExportCSV = () => {
    if (!patients || patients.length === 0) {
      toast.error("No patients found to export.");
      return;
    }
    
    const headers = ["Patient ID", "Name", "Contact", "Demographics", "Status", "Branch", "Last Visit"];
    const csvRows = [headers.join(',')];
    
    patients.forEach(p => {
      const row = [
        p.pid || p.id || '',
        `"${p.name || ''}"`,
        `"${p.contact || ''}"`,
        `"${p.demographics || ''}"`,
        `"${p.status || ''}"`,
        `"${p.branch || ''}"`,
        `"${p.lastVisit || ''}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Patients exported successfully.");
  };

  const renderMainSettings = () => (
    <div className="max-w-5xl animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2 text-lg">Platform configuration and security protocols</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Clinic Profile */}
        {user?.role === 'superadmin' && (
          <div 
            onClick={() => { setFormData(settings); setActiveSection('clinic'); }}
            className="group p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Building size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Clinic Profile</h3>
              <p className="text-slate-500 mt-2 font-medium leading-relaxed">Update clinic name, branding, contact details, and primary address.</p>
            </div>
          </div>
        )}

        {/* Data Management (Replaced System Preferences) */}
        {user?.role === 'superadmin' && (
          <div 
            onClick={() => { setActiveSection('data'); setWipeConfirmation(''); }}
            className="group p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-orange-300 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Database size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Data Management</h3>
              <p className="text-slate-500 mt-2 font-medium leading-relaxed">System-wide data cleanup. Remove all operational data from the portal.</p>
            </div>
          </div>
        )}

        {/* Security & Access */}
        <div 
          onClick={() => setActiveSection('security')}
          className="group p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-red-200 transition-all cursor-pointer relative overflow-hidden md:col-span-2"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="p-4 bg-red-50 text-red-500 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Security & Password Management</h3>
              <p className="text-slate-500 mt-2 font-medium leading-relaxed max-w-xl">Reset platform-wide access, enforce password changes, and manage authentication protocols.</p>
            </div>
            <div className="hidden lg:block">
               <AlertTriangle size={64} className="text-red-100" />
            </div>
          </div>
        </div>

        {/* Data Export (Super Admin Only) */}
        {user?.role === 'superadmin' && (
          <div 
            onClick={handleExportCSV}
            className="group p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden md:col-span-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative">
              <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform flex items-center space-x-2">
                <Download size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Export All Patients (CSV)</h3>
              <p className="text-slate-500 mt-2 font-medium leading-relaxed">Download a complete CSV spreadsheet of all registered patients in the system.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderManageScreen = () => {
    let title = '';
    let description = '';
    let icon = null;

    switch (activeSection) {
      case 'clinic':
        title = 'Clinic Profile';
        description = 'Update your healthcare center basic information';
        icon = <Building size={24} />;
        break;
      case 'data':
        title = 'Data Management';
        description = 'Remove all operational data throughout portal';
        icon = <Database size={24} />;
        break;
      case 'security':
        title = 'Security Protocol';
        description = 'Global password and access management';
        icon = <Lock size={24} />;
        break;
    }

    return (
      <div className="max-w-4xl animate-in slide-in-from-right-10 duration-500">
        <button 
          onClick={() => setActiveSection(null)}
          className="flex items-center space-x-2 text-slate-500 hover:text-primary transition-all mb-8 font-bold group"
        >
          <div className="p-2 bg-white border border-slate-200 rounded-xl group-hover:border-primary group-hover:text-primary transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center space-x-4 mb-10">
          <div className={`p-4 ${activeSection === 'security' || activeSection === 'data' ? (activeSection === 'data' ? 'bg-orange-500 shadow-orange-500/20' : 'bg-red-500 shadow-red-500/20') : 'bg-primary shadow-primary/20'} text-white rounded-3xl shadow-lg`}>
            {icon}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">{title}</h1>
            <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">{description}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/40 p-10 relative overflow-hidden">
          {saveSuccess && (
            <div className="absolute top-0 inset-x-0 bg-green-500 text-white py-3 px-6 flex items-center justify-center space-x-2 animate-in slide-in-from-top-full duration-300">
              <CheckCircle2 size={18} />
              <span className="font-bold">Settings updated successfully!</span>
            </div>
          )}

          <div className="space-y-8">
            {activeSection === 'clinic' && user?.role === 'superadmin' && (
              <form onSubmit={handleSave} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinic / Enterprise Name</label>
                  <input 
                    type="text" 
                    value={formData.clinicName}
                    onChange={e => setFormData({ ...formData, clinicName: e.target.value })}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headquarters Address</label>
                  <textarea 
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    rows={3} 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all" 
                  />
                </div>

                <div className="pt-10 flex flex-col sm:flex-row justify-end gap-4 border-t border-slate-100">
                  <button type="submit" className="flex items-center justify-center space-x-2 px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 uppercase tracking-widest text-xs">
                    <Save size={18} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {activeSection === 'data' && user?.role === 'superadmin' && (
              <div className="space-y-8">
                <div className="p-10 bg-orange-50 rounded-[2.5rem] border border-orange-100 text-center">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-orange-500 shadow-sm border border-orange-100">
                    <AlertTriangle size={40} />
                  </div>
                  <h4 className="text-2xl font-black text-orange-800 mb-4">Wipe Operational Data</h4>
                  <p className="text-orange-700/80 font-bold text-sm mb-6 max-w-lg mx-auto">
                    This will permanently delete all Patients, Appointments, Billing, and Medical Records. 
                    Staff accounts and your login will remain intact.
                  </p>

                  <div className="max-w-md mx-auto space-y-4">
                    <label className="text-xs font-bold text-orange-800 uppercase tracking-widest block">
                      Type <span className="text-red-600">delete in portal</span> to confirm
                    </label>
                    <input 
                      type="text" 
                      value={wipeConfirmation}
                      onChange={(e) => setWipeConfirmation(e.target.value)}
                      placeholder="delete in portal"
                      className="w-full px-4 py-4 bg-white border-2 border-orange-200 text-orange-900 font-black rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-center placeholder:font-normal placeholder:text-orange-300"
                    />
                    
                    <button 
                      onClick={handleWipeData}
                      disabled={wipeConfirmation !== 'delete in portal'}
                      className="w-full flex items-center justify-center space-x-3 px-10 py-5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all shadow-xl shadow-orange-500/20 uppercase tracking-widest text-sm"
                    >
                      <Trash2 size={20} />
                      <span>Remove all data throughout all portal</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-8">
                <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <h4 className="text-2xl font-black text-slate-800 mb-2">Change Password</h4>
                  <p className="text-slate-500 font-medium text-sm mb-8">
                    Update your account password. You will be logged out and required to sign in again after the change is successful.
                  </p>

                  <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
                      <input 
                        type="password" 
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-4 py-4 bg-white border border-slate-200 text-slate-800 font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-4 bg-white border border-slate-200 text-slate-800 font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
                      <input 
                        type="password" 
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-4 bg-white border border-slate-200 text-slate-800 font-bold rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all" 
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-primary hover:bg-[#4a9f9f] text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase tracking-widest text-sm"
                    >
                      <Lock size={18} />
                      <span>Update Password</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-full pb-10">
        {activeSection ? renderManageScreen() : renderMainSettings()}
      </div>
    </Layout>
  );
}