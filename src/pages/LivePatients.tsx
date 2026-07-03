import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { apiService } from '@/services/apiService';
import { Activity, Clock, Play, Square, User, Calendar, CheckCircle2, AlertCircle, Loader2, ArrowRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '@/context/AppDataContext';

interface Appointment {
  _id: string;
  patientId: {
    pid?: string;
  } | string;
  patientName: string;
  therapistId: string;
  therapistName: string;
  appointmentDate: string;
  time: string;
  duration: number;
  branch: string;
  sessionType: string;
  status: string;
  liveStatus: 'SCHEDULED' | 'CHECKED_IN' | 'CHECKED_OUT';
  checkedInAt?: string;
  checkedOutAt?: string;
  initials: string;
  initialsBg: string;
}

// Subcomponent to render dynamic session timer
function ActiveTimer({ checkedInAt, duration }: { checkedInAt: string; duration: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const diffMs = new Date().getTime() - new Date(checkedInAt).getTime();
      setElapsed(Math.max(0, Math.floor(diffMs / (60 * 1000))));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [checkedInAt]);

  const isOvertime = elapsed >= duration;

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider">Consultation Time</span>
        <span className={`font-black ${isOvertime ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
          {elapsed} / {duration} MINS
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isOvertime 
              ? 'bg-red-500 animate-pulse' 
              : elapsed >= duration - 5 
                ? 'bg-amber-500' 
                : 'bg-primary'
          }`}
          style={{ width: `${Math.min(100, (elapsed / duration) * 100)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] font-semibold">
        <span className="text-slate-400">Started: {new Date(checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        {isOvertime ? (
          <span className="text-red-500 font-bold flex items-center gap-1">
            <AlertCircle size={10} /> Overtime by {elapsed - duration}m
          </span>
        ) : (
          <span className="text-slate-500">{duration - elapsed}m left</span>
        )}
      </div>
    </div>
  );
}

export function LivePatients() {
  const { user } = useAuth();
  const { branches } = useAppData();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SCHEDULED' | 'CHECKED_IN' | 'CHECKED_OUT'>('ALL');
  const [branchFilter, setBranchFilter] = useState('All Branches');

  const fetchTodayAppointments = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const data = await apiService.get(`/appointments?date=${todayStr}`);
      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error loading live telemetry:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayAppointments();
    
    // Poll every 5 seconds for real-time telemetry updates
    const interval = setInterval(fetchTodayAppointments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckin = async (id: string) => {
    try {
      const res = await apiService.patch(`/appointments/${id}/checkin`, {});
      if (res.success) {
        toast.success("Patient successfully checked in!");
        fetchTodayAppointments();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckout = async (id: string) => {
    try {
      const res = await apiService.patch(`/appointments/${id}/checkout`, {});
      if (res.success) {
        toast.success("Checkout successful. No further action needed.");
        fetchTodayAppointments();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchesTab = activeTab === 'ALL' || appt.liveStatus === activeTab;
    const matchesBranch = branchFilter === 'All Branches' || appt.branch === branchFilter;
    return matchesTab && matchesBranch;
  });

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
        
        {/* Upper Gradient Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/10 to-emerald-500/10 border border-primary/20 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:space-x-8 text-center md:text-left transition-all">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0 mb-4 md:mb-0 animate-pulse">
            <Activity size={32} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Live Telemetry Board</h1>
            <p className="text-slate-500 font-medium mt-1 leading-relaxed text-sm">
              Real-time patient flow and consultation tracker. Check in incoming patients, monitor ongoing consultation timers, and finalize session checkout logs.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-center gap-3">
            {user?.role === 'staff' ? (
              user?.branch && (
                <span className="text-xs bg-primary/10 border border-primary/20 text-[#2e8b8b] font-black uppercase tracking-wider rounded-xl px-4 py-2 shadow-sm whitespace-nowrap">
                  Branch: {user.branch}
                </span>
              )
            ) : (
              <div className="relative">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-[#2e8b8b] font-bold text-xs rounded-xl pl-4 pr-8 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="All Branches">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              </div>
            )}
            <div className="flex items-center space-x-2 text-xs bg-white/80 border border-slate-100 rounded-xl px-4 py-2 text-slate-500 font-bold shadow-sm whitespace-nowrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>REAL-TIME UPDATE SYNCED</span>
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex overflow-x-auto bg-slate-100/60 p-1.5 rounded-2xl border border-slate-100 space-x-1 shrink-0 scrollbar-none">
          {(['ALL', 'SCHEDULED', 'CHECKED_IN', 'CHECKED_OUT'] as const).map((tab) => {
            const counts = appointments.filter(a => tab === 'ALL' ? true : a.liveStatus === tab).length;
            const tabNames: Record<string, string> = {
              ALL: 'All Sessions',
              SCHEDULED: 'Scheduled',
              CHECKED_IN: 'In Consultation',
              CHECKED_OUT: 'Completed'
            };

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center space-x-2 ${
                  activeTab === tab
                    ? 'bg-white shadow-sm text-[#328585]'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
                }`}
              >
                <span>{tabNames[tab]}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab 
                    ? 'bg-[#e0f4f4] text-[#2e8b8b]' 
                    : 'bg-slate-200/60 text-slate-600'
                }`}>
                  {counts}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 size={36} className="text-primary animate-spin" />
            <p className="text-slate-400 font-bold text-sm">Loading today's clinical board...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-xl shadow-slate-100/50 flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 bg-slate-50 rounded-full text-slate-300">
              <Calendar size={36} />
            </div>
            <h2 className="text-lg font-bold text-slate-700">No appointments found</h2>
            <p className="text-xs font-semibold text-slate-400 max-w-sm">
              There are no active, scheduled, or completed appointments fitting this category on today's telemetry timeline.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appt) => {
              // Extract PID safely (could be nested patient object or plain string, handles both)
              const pid = typeof appt.patientId === 'object' && appt.patientId !== null
                ? appt.patientId.pid || 'N/A'
                : 'N/A';

              return (
                <div 
                  key={appt._id} 
                  className={`bg-white border rounded-3xl p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between space-y-5 ${
                    appt.liveStatus === 'CHECKED_IN' 
                      ? 'border-primary/30 ring-1 ring-primary/10 bg-primary/10/5' 
                      : 'border-slate-100'
                  }`}
                >
                  
                  {/* Header: Patient Info & Status Badge */}
                  <div className="flex justify-between items-start space-x-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-sm shrink-0 ${appt.initialsBg || 'bg-primary/10 text-primary'}`}>
                        {appt.initials}
                      </div>
                      <div className="truncate max-w-[130px] md:max-w-[150px]">
                        <h3 className="font-bold text-slate-800 text-sm truncate leading-snug">{appt.patientName}</h3>
                        <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">ID: {pid}</p>
                      </div>
                    </div>

                    {/* Status Badges */}
                    {appt.liveStatus === 'SCHEDULED' && (
                      <span className="px-2.5 py-1 bg-sky-50 text-sky-600 border border-sky-100 text-[10px] font-black uppercase rounded-full tracking-wider">
                        Scheduled
                      </span>
                    )}
                    {appt.liveStatus === 'CHECKED_IN' && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase rounded-full tracking-wider flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    )}
                    {appt.liveStatus === 'CHECKED_OUT' && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black uppercase rounded-full tracking-wider">
                        Finished
                      </span>
                    )}
                  </div>

                  {/* Metadata Body */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/50 p-3 rounded-2xl border border-slate-50">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Therapist</span>
                      <span className="font-bold text-slate-700 truncate block">{appt.therapistName}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Type</span>
                      <span className="font-bold text-slate-700 truncate block">{appt.sessionType}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Time Slot</span>
                      <span className="font-bold text-slate-700 block">{appt.time}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Branch</span>
                      <span className="font-bold text-slate-700 truncate block">{appt.branch}</span>
                    </div>
                  </div>

                  {/* Dynamic Time Counter (If Checked In) */}
                  {appt.liveStatus === 'CHECKED_IN' && appt.checkedInAt && (
                    <ActiveTimer checkedInAt={appt.checkedInAt} duration={appt.duration} />
                  )}

                  {/* Completed Timestamps */}
                  {appt.liveStatus === 'CHECKED_OUT' && appt.checkedInAt && appt.checkedOutAt && (
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-400 px-1 border-t border-dashed border-slate-100 pt-3">
                      <span>In: {new Date(appt.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <ArrowRight size={12} />
                      <span>Out: {new Date(appt.checkedOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>(Duration: {Math.max(1, Math.round((new Date(appt.checkedOutAt).getTime() - new Date(appt.checkedInAt).getTime()) / (60 * 1000)))}m)</span>
                    </div>
                  )}

                  {/* Actions Block */}
                  <div className="pt-2">
                    {appt.liveStatus === 'SCHEDULED' && (
                      <button
                        onClick={() => handleCheckin(appt._id)}
                        className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm shadow-primary/20 hover:shadow-lg group"
                      >
                        <Play size={14} className="fill-white" />
                        <span className="uppercase tracking-wider">Check In Consultation</span>
                      </button>
                    )}
                    {appt.liveStatus === 'CHECKED_IN' && (
                      <button
                        onClick={() => handleCheckout(appt._id)}
                        className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm shadow-emerald-600/10 hover:shadow-lg group"
                      >
                        <Square size={12} className="fill-white" />
                        <span className="uppercase tracking-wider">Check Out Consultation</span>
                      </button>
                    )}
                    {appt.liveStatus === 'CHECKED_OUT' && (
                      <div className="w-full flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-xs py-3 px-4 rounded-xl cursor-default">
                        <CheckCircle2 size={15} />
                        <span className="uppercase tracking-wider">Done - No Action Needed</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </Layout>
  );
}
