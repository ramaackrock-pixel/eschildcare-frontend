import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/apiService';
import { generatePayrollPDF } from '@/utils/pdfGenerator';
import { Calendar, CreditCard, Clock, MapPin, Download, AlertCircle, CheckCircle2, User, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export function AttendancePayroll() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [location, setLocation] = useState('Determining location...');
  const [gpsEnabled, setGpsEnabled] = useState<boolean | null>(null);

  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMonthName = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/staff/profile/me');
      if (response.success && response.staff) {
        setProfile(response.staff);
      }
    } catch (e) {
      console.error('Error fetching staff profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    
    // Get Geolocation on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lon = position.coords.longitude.toFixed(6);
          setLocation(`GPS Coordinates: [${lat}, ${lon}]`);
          setGpsEnabled(true);
        },
        (error) => {
          setLocation('Location Disabled - Please enable GPS');
          setGpsEnabled(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocation('Geolocation not supported');
      setGpsEnabled(false);
    }
  }, []);

  const todayLog = profile?.attendanceLogs?.find((log: any) => log.date === todayStr);
  const isCheckedIn = !!todayLog;
  const isCheckedOut = todayLog && (todayLog.checkOutTime || todayLog.status === 'presented today');

  const handleCheckIn = async () => {
    setChecking(true);
    try {
      const res = await apiService.post('/staff/attendance/check-in', { location });
      if (res.success) {
        toast.success(res.message);
        fetchProfile();
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    try {
      const res = await apiService.post('/staff/attendance/check-out', { location });
      if (res.success) {
        toast.success(res.message);
        fetchProfile();
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const handleDownloadPayslip = (log: any) => {
    const memberPayload = {
      ...profile,
      id: profile.id || profile._id,
      payrollLogs: profile.payrollLogs || []
    };
    generatePayrollPDF(memberPayload, getMonthName(log.month));
  };

  const isAdministrative = profile?.role === 'Admin / Receptionist' || user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto">
        {/* Welcome Greeting Banner */}
        <div className="bg-gradient-to-r from-primary via-primary to-emerald-500 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary/20 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none"></div>
          <div className="space-y-2 text-center md:text-left z-10">
            <h1 className="text-3xl font-extrabold tracking-tight">
              Hello, {profile?.name || user?.name || 'Staff'}!
            </h1>
            <p className="text-primary-foreground/90 font-medium text-sm md:text-base">
              {getGreeting()} • Welcome back to your portal.
            </p>
          </div>
          <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/10 text-xs md:text-sm font-bold tracking-wide z-10 uppercase">
            {todayFormatted}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="animate-spin text-primary h-10 w-10" />
            <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Loading portal information...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Self Attendance Card */}
            <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Attendance Portal</h2>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Self Check-In / Check-Out</p>
                  </div>
                </div>

                {isAdministrative ? (
                  <div className="p-6 bg-slate-50 border border-slate-100/80 rounded-2xl text-center space-y-3">
                    <AlertCircle size={28} className="text-slate-400 mx-auto" />
                    <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Not Applicable</p>
                    <p className="text-xs font-medium text-slate-400 leading-relaxed">
                      Self attendance check-in/out is not required for Administrative or Receptionist profiles.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center space-x-2 text-slate-600 text-xs font-semibold">
                      <MapPin size={14} className="text-primary" />
                      <span className="truncate w-full">{location}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                      <span className="text-xs font-bold text-slate-400 uppercase">Check In</span>
                      <span className="text-sm font-black text-slate-700">{todayLog?.checkInTime || '--:--'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase">Check Out</span>
                      <span className="text-sm font-black text-slate-700">{todayLog?.checkOutTime || '--:--'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Attendance Actions */}
              {!isAdministrative && (
                <div className="space-y-3 pt-4">
                  {isCheckedOut ? (
                    <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-center space-y-2">
                      <CheckCircle2 size={32} className="text-emerald-500 animate-bounce" />
                      <p className="text-sm font-extrabold uppercase tracking-wider">Attendance Completed</p>
                      <p className="text-xs font-medium text-emerald-600">Great work today! See you tomorrow.</p>
                    </div>
                  ) : !isCheckedIn ? (
                    <button
                      onClick={handleCheckIn}
                      disabled={checking || gpsEnabled !== true}
                      className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary hover:opacity-95 text-white font-extrabold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checking ? <RefreshCw className="animate-spin h-5 w-5" /> : 'Check In Today'}
                    </button>
                  ) : (
                    <button
                      onClick={handleCheckOut}
                      disabled={checking || gpsEnabled !== true}
                      className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary/80 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checking ? <RefreshCw className="animate-spin h-5 w-5" /> : 'Check Out Today'}
                    </button>
                  )}

                  {gpsEnabled === false && (
                    <div className="flex items-center space-x-2 text-[10px] text-red-600 font-bold bg-red-50 border border-red-100/50 p-3 rounded-xl">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>GPS is disabled. You must allow location access in your browser to check in/out.</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100/50 p-3 rounded-xl">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Security policy enforces today-only actions. Backdated check-ins are restricted.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payroll Grid */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-100/50 p-6 flex flex-col space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">My Payroll</h2>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Official Payslips Grid</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Month</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Days Present</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Base Salary</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Net Pay</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                    {profile?.payrollLogs && profile.payrollLogs.length > 0 ? (
                      profile.payrollLogs.map((log: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700">{getMonthName(log.month)}</td>
                          <td className="px-6 py-4">{log.daysPresent} days</td>
                          <td className="px-6 py-4">₹{log.salary?.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 text-primary font-black">₹{log.netPay?.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDownloadPayslip(log)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-[#2e8b8b] rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                            >
                              <Download size={12} />
                              <span>PDF</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                          No payroll records added yet by administrators.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
