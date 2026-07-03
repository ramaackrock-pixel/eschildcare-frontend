import { Search, HelpCircle, Menu, Bell, AlertTriangle, X, Check, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

interface HeaderProps {
  onMenuClick?: () => void;
}

interface Notification {
  _id: string;
  appointmentId: string;
  patientId?: string;
  patientName: string;
  patientPid: string;
  doctorName: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { searchQuery, setSearchQuery } = useSearch();
  const { patients } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Notifications State & Refs
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<Notification[]>([]);

  // Sync ref with state to prevent stale closure in polling interval
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const filteredPatients = patients.filter(p => {
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) ||
      (p.pid && p.pid.toLowerCase().includes(q)) ||
      p.id.toLowerCase().includes(q) ||
      (p.contact && p.contact.includes(q));
  }).slice(0, 5);

  const fetchNotifications = async (showToastOnNew = false) => {
    try {
      const data = await apiService.get('/notifications');
      if (data.success) {
        const newNotifications: Notification[] = data.notifications || [];
        
        if (showToastOnNew) {
          newNotifications.forEach((newNotif) => {
            const alreadyExists = notificationsRef.current.some(old => old._id === newNotif._id);
            if (!alreadyExists) {
              // Trigger visually rich toast notification
              toast.custom((t) => (
                <div 
                  className={`${
                    t.visible ? 'animate-in fade-in slide-in-from-top-4 duration-300' : 'animate-out fade-out slide-out-to-top-4 duration-300'
                  } max-w-md w-full bg-white/95 backdrop-blur-md shadow-2xl rounded-3xl pointer-events-auto flex ring-1 ring-black/5 border border-amber-500/20 overflow-hidden`}
                >
                  <div className="flex-1 w-0 p-5">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-500 shadow-sm animate-bounce">
                          <AlertTriangle size={20} />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-black text-slate-800 tracking-tight">Consultation Ending Soon ⚠️</p>
                        <p className="mt-1.5 text-xs font-semibold text-slate-500 leading-relaxed">
                          Patient <span className="font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20/50">{newNotif.patientName} ({newNotif.patientPid})</span> with Dr. <span className="font-extrabold text-slate-700">{newNotif.doctorName}</span> is going to end in 5 minutes!
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex border-l border-slate-100">
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        handleDismiss(newNotif._id);
                      }}
                      className="w-full border border-transparent rounded-none rounded-r-3xl px-6 flex items-center justify-center text-xs font-black uppercase tracking-widest text-primary hover:text-[#328585] hover:bg-slate-50 transition-colors focus:outline-none"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ), { duration: 10000, position: 'top-right' });
            }
          });
        }
        
        setNotifications(newNotifications);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const res = await apiService.patch(`/notifications/${id}/read`, {});
      if (res.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  useEffect(() => {
    // Poll notifications every 10 seconds only for admin/superadmin roles
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    if (!isAdmin) return;

    fetchNotifications(false); // Initial load (silent, no toast)

    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Suggestion dropdown click outside
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      // Notification dropdown click outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPatient = (id: string) => {
    navigate(`/patients/${id}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredPatients.length > 0) {
      handleSelectPatient(filteredPatients[0].id);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-slate-200 print:hidden z-30">
      <div className="flex items-center space-x-4 mr-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-24 h-10 rounded-lg overflow-hidden bg-white/50 p-0.5 border border-primary/30 shadow-sm">
            <img
              src="/logo.png"
              alt="H2F Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-xl">
        <div className="relative" ref={suggestionRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />

          {showSuggestions && searchQuery && filteredPatients.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Patient Suggestions</span>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient.id)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${patient.initialsBg}`}>
                      {patient.initials}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{patient.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{patient.pid || patient.id} • {patient.branch}</div>
                    </div>
                    <div className="text-[10px] font-black text-slate-300 group-hover:text-primary">VIEW</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6 ml-4">
        
        {/* Real-time Notification Bell */}
        {isAdmin && (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOpenNotifications(!isOpenNotifications)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all shrink-0 focus:outline-none"
            >
              <Bell size={20} className={notifications.length > 0 ? "animate-pulse" : ""} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[8px] font-black text-white items-center justify-center">
                    {notifications.length}
                  </span>
                </span>
              )}
            </button>

            {/* Premium Glassmorphic Dropdown Panel */}
            {isOpenNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Active System Alerts</span>
                  {notifications.length > 0 && (
                    <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {notifications.length} Ending Soon
                    </span>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-sm">
                        <Check size={20} />
                      </div>
                      <p className="text-xs font-extrabold text-slate-700">All Quiet</p>
                      <p className="text-[10px] text-slate-400 font-semibold max-w-[180px] leading-relaxed">
                        No patient consultations are ending within the 5-minute warning margin.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif._id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start space-x-3 group relative">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                          <AlertTriangle size={15} />
                        </div>
                        <div className="flex-1 pr-6">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">Consultation Overtime Warning</p>
                          <p className="text-[11px] font-bold text-slate-600 leading-relaxed mt-1">
                            Patient <span className="text-primary font-extrabold">{notif.patientName} ({notif.patientPid})</span> with Dr. <span className="text-slate-800 font-extrabold">{notif.doctorName}</span> is ending soon!
                          </p>
                          <p className="text-[9px] font-semibold text-slate-400 mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDismiss(notif._id)}
                          className="absolute right-3 top-4 p-1 rounded-full text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100 focus:outline-none"
                          title="Dismiss Alert"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        <div className="relative group">
          <button className="hidden md:block text-slate-500 hover:text-slate-700 p-2">
            <HelpCircle size={20} />
          </button>
          {/* Custom Tooltip */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-slate-800 text-white text-[10px] p-3 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60] border border-slate-700 pointer-events-none font-medium leading-relaxed">
            <div className="absolute top-0 right-4 -translate-y-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-t border-slate-700"></div>
            This is confidential; no outside organization can access this information.
          </div>
        </div>
      </div>
    </header>
  );
}
