import { useState, useRef, useEffect } from 'react';
import { Upload, Send, MessageSquare, AlertCircle, Info, Search, CheckSquare, Square, Filter, RefreshCw, Calendar as CalendarIcon, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '@/services/apiService';
import toast from 'react-hot-toast';
import { Layout } from '@/components/Layout';
import { useAppData } from '@/context/AppDataContext';

export function Campaigns() {
  const { patients, branches } = useAppData();
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dailySent, setDailySent] = useState(0);
  const [messagedPatientsToday, setMessagedPatientsToday] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const DAILY_LIMIT = 50;
  const BATCH_LIMIT = 50;
  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, branchFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiService.getCampaignStats();
      if (res.success) {
        setDailySent(res.stats.messagesSent || 0);
        setMessagedPatientsToday(res.stats.messagedPatients || []);
      }
    } catch (e) {
      console.error("Failed to fetch campaign stats", e);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const togglePatient = (id: string) => {
    setSelectedPatientIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pId => pId !== id);
      } else {
        if (prev.length >= BATCH_LIMIT) {
          toast.error(`You can only select up to ${BATCH_LIMIT} patients per batch.`);
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const selectAllFiltered = () => {
    const idsToAdd = filteredPatients
      .filter(p => {
        const noConsent = p.whatsappConsent === false;
        const noPhone = !p.contact || p.contact.trim() === '';
        const alreadySent = messagedPatientsToday.includes(p.id);
        return !noConsent && !noPhone && !alreadySent;
      })
      .map(p => p.id)
      .filter(id => !selectedPatientIds.includes(id));
    
    if (selectedPatientIds.length + idsToAdd.length > BATCH_LIMIT) {
      const remainingSlots = BATCH_LIMIT - selectedPatientIds.length;
      setSelectedPatientIds(prev => [...prev, ...idsToAdd.slice(0, remainingSlots)]);
      toast.error(`Only ${remainingSlots} more patients could be selected to reach the ${BATCH_LIMIT} limit.`);
    } else {
      setSelectedPatientIds(prev => [...prev, ...idsToAdd]);
    }
  };

  const deselectAllFiltered = () => {
    const filteredIds = filteredPatients.map(p => p.id);
    setSelectedPatientIds(prev => prev.filter(id => !filteredIds.includes(id)));
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.contact && p.contact.includes(searchTerm));
    const matchesBranch = branchFilter === 'All Branches' || p.branch === branchFilter;
    return matchesSearch && matchesBranch;
  });

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const displayedPatients = filteredPatients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleResetBadges = async () => {
    // Determine which patients to reset:
    // If there are selected patients with a badge, reset only them.
    // Otherwise, if no selection is made, ask if they want to reset all filtered patients that have a badge.
    
    let patientsToReset: string[] = [];
    
    if (selectedPatientIds.length > 0) {
      patientsToReset = selectedPatientIds;
    } else {
      const filteredWithBadge = filteredPatients.filter(p => p.lastCampaignDate || messagedPatientsToday.includes(p.id)).map(p => p.id);
      if (filteredWithBadge.length > 0) {
        if (!window.confirm(`No patients selected. Do you want to reset the campaign badge for all ${filteredWithBadge.length} currently filtered patients?`)) {
          return;
        }
        patientsToReset = filteredWithBadge;
      } else {
        toast.error("No patients in the current view have a campaign badge to reset.");
        return;
      }
    }

    setIsResetting(true);
    try {
      const res = await apiService.resetCampaignBadges(patientsToReset);
      toast.success(res?.message || "Badges reset successfully!");
      setSelectedPatientIds([]);
      // A full page reload or refetch of patients might be needed here to update the UI
      window.location.reload(); 
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to reset badges.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSend = async () => {
    if (selectedPatientIds.length === 0) {
      toast.error("Please select at least one patient.");
      return;
    }
    if (selectedPatientIds.length > BATCH_LIMIT) {
      toast.error(`Maximum ${BATCH_LIMIT} patients allowed per batch.`);
      return;
    }
    if (dailySent + selectedPatientIds.length > DAILY_LIMIT) {
      toast.error(`This will exceed your daily limit of ${DAILY_LIMIT} messages.`);
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      if (text.trim()) {
        formData.append('text', text.trim());
      }
      if (image) {
        formData.append('image', image);
      }
      formData.append('patientIds', JSON.stringify(selectedPatientIds));

      const res = await apiService.sendCampaign(formData);
      toast.success(res?.message || "Campaign sent successfully!");
      
      setText('');
      setImage(null);
      setSelectedPatientIds([]);
      fetchStats(); // refresh stats immediately
    } catch (error: any) {
      // Error handled by interceptor, but we catch it to un-set isSending
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const dailyPercentage = Math.min(100, Math.round((dailySent / DAILY_LIMIT) * 100));

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Campaigns</h1>
        <p className="text-sm font-medium text-slate-600 mt-1">
          Broadcast targeted WhatsApp messages to your patients.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form & Limits */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Rate Limits Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Info size={20} />
              </div>
              <h3 className="font-bold text-slate-800">WhatsApp Limits</h3>
            </div>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              To protect your number from being flagged as spam, strict limits are enforced by the system. You must send campaigns in batches.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                  <span>Batch Limit</span>
                  <span>{selectedPatientIds.length} / {BATCH_LIMIT}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${selectedPatientIds.length > BATCH_LIMIT ? 'bg-red-500' : 'bg-primary'}`} 
                    style={{ width: `${Math.min(100, (selectedPatientIds.length / BATCH_LIMIT) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
                  <span>Daily Quota</span>
                  <span>{dailySent} / {DAILY_LIMIT}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${dailyPercentage > 90 ? 'bg-red-500' : dailyPercentage > 75 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                    style={{ width: `${dailyPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Composer Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <MessageSquare size={18} />
              </div>
              <h2 className="font-bold text-slate-800">Composer</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type message body..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-32 resize-none"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                  "Hi [Name]" is added automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Image (Optional)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${image ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
                    }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {image ? (
                    <div className="text-center w-full">
                      <img src={URL.createObjectURL(image)} alt="Preview" className="max-h-24 mx-auto rounded-lg mb-2 shadow-sm object-cover" />
                      <p className="text-xs font-bold text-primary truncate px-2">{image.name}</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-bold">Upload Image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audience Selector */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[700px]">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800">Select Audience</h2>
            <div className="flex space-x-2">
              <button 
                onClick={selectAllFiltered}
                disabled={selectedPatientIds.length >= BATCH_LIMIT}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  selectedPatientIds.length >= BATCH_LIMIT 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'text-primary bg-primary/10 hover:bg-primary/20'
                }`}
              >
                Select Visible
              </button>
              <button 
                onClick={deselectAllFiltered}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Clear Visible
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search patients by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="relative w-full sm:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
              >
                <option value="All Branches">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {filteredPatients.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Search size={40} className="opacity-20 mb-3" />
                <p className="text-sm font-bold">No patients found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedPatients.map(patient => {
                  const isSelected = selectedPatientIds.includes(patient.id);
                  const noConsent = patient.whatsappConsent === false;
                  const noPhone = !patient.contact || patient.contact.trim() === '';
                  const alreadySentToday = messagedPatientsToday.includes(patient.id);
                  const hasSentBadge = !!patient.lastCampaignDate;

                  const isDisabled = noConsent || noPhone || alreadySentToday || hasSentBadge;

                  return (
                    <div 
                      key={patient.id}
                      onClick={() => !isDisabled && togglePatient(patient.id)}
                      className={`relative flex flex-col p-4 rounded-xl border transition-all ${
                        isDisabled 
                          ? 'opacity-60 cursor-not-allowed bg-slate-50 border-slate-200' 
                          : isSelected 
                            ? 'bg-primary/5 border-primary shadow-sm cursor-pointer' 
                            : 'bg-white border-slate-200 hover:border-primary/50 cursor-pointer shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${patient.initialsBg || 'bg-slate-200'}`}>
                            {patient.initials || patient.name.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{patient.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">{patient.contact || 'No phone'}</p>
                          </div>
                        </div>
                        <div className="text-slate-400">
                          {isSelected ? <CheckSquare size={20} className="text-primary" /> : <Square size={20} />}
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-3 border-t border-slate-100 flex flex-col gap-1">
                        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase">
                          <MapPin size={12} className="mr-1" />
                          <span className="truncate">{patient.branch}</span>
                        </div>
                        
                        {hasSentBadge ? (
                          <div className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit mt-1">
                            <CalendarIcon size={12} className="mr-1" />
                            Sent: {new Date(patient.lastCampaignDate!).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </div>
                        ) : alreadySentToday ? (
                          <div className="flex items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit mt-1">
                            <CalendarIcon size={12} className="mr-1" />
                            Sent Today
                          </div>
                        ) : noConsent ? (
                          <div className="flex items-center text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md w-fit mt-1">
                            No Consent
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between mt-6 px-2 pb-2">
                <p className="text-sm text-slate-500 font-medium hidden sm:block">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)} of {filteredPatients.length} patients
                </p>
                <div className="flex items-center space-x-2 ml-auto sm:ml-0">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-bold text-slate-700 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleResetBadges}
              disabled={isResetting}
              className="flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              <RefreshCw size={16} className={isResetting ? 'animate-spin' : ''} />
              <span>Reset Badges</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <p className="text-sm font-bold text-slate-600">
                <span className={selectedPatientIds.length > BATCH_LIMIT ? 'text-red-500' : 'text-primary'}>
                  {selectedPatientIds.length}
                </span>
                {' '}selected
              </p>
              <button
                onClick={handleSend}
                disabled={isSending || selectedPatientIds.length === 0 || selectedPatientIds.length > BATCH_LIMIT || (!text.trim() && !image)}
                className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-[#4a9f9f] rounded-xl transition-all flex items-center space-x-2 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:opacity-100 disabled:cursor-not-allowed shadow-lg shadow-primary/20 active:scale-95"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
