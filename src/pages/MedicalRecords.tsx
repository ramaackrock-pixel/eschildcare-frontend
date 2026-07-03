import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  Calendar, 
  MoreVertical, 
  File, 
  FilterX, 
  ChevronLeft, 
  ChevronRight,
  X,
  User,
  Clock,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useSearch } from '@/context/SearchContext';
import type { MedicalRecord, MedicalRecordType } from '@/types/medicalRecord';
import RecordModal from '@/components/dashboard/RecordModal';
import { generateAssessmentPDF } from '@/utils/pdfGenerator';

const ITEMS_PER_PAGE = 10;

export function MedicalRecords() {
  const { searchQuery } = useSearch();
  const { medicalRecords, addMedicalRecord, deleteMedicalRecord, branches, patients } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>('All Status');
  const [branchFilter, setBranchFilter] = useState<string>('All Branches');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredRecords = useMemo(() => {
    return medicalRecords.filter(record => {
      const activeSearch = searchTerm || searchQuery;
      const patient = patients.find(p => p.id === record.pid || p.name === record.patientName);
      const displayPid = patient?.pid || record.pid;
      const patientMatch = record.patientName ? record.patientName.toLowerCase().includes(activeSearch.toLowerCase()) : false;
      const pidMatch = displayPid ? displayPid.toLowerCase().includes(activeSearch.toLowerCase()) : false;
      const matchesSearch = patientMatch || pidMatch;
      const matchesType = recordTypeFilter === 'All Status' || record.recordType === recordTypeFilter;
      const matchesBranch = branchFilter === 'All Branches' || record.branch === branchFilter;
      
      const matchesDate = !dateFilter || (() => {
        const recordDate = new Date(record.uploadedDate);
        if (isNaN(recordDate.getTime())) return false;
        const filterDate = new Date(dateFilter);
        return recordDate.getFullYear() === filterDate.getFullYear() &&
               recordDate.getMonth() === filterDate.getMonth() &&
               recordDate.getDate() === filterDate.getDate();
      })();

      return matchesSearch && matchesType && matchesBranch && matchesDate;
    });
  }, [medicalRecords, searchTerm, searchQuery, recordTypeFilter, branchFilter, dateFilter, patients]);

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleClearFilters = () => {
    setSearchTerm('');
    setRecordTypeFilter('All Status');
    setBranchFilter('All Branches');
    setDateFilter('');
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      deleteMedicalRecord(id);
      setActiveMenuId(null);
    }
  };

  const handleSaveRecord = (data: any) => {
    addMedicalRecord(data);
    setIsModalOpen(false);
  };

  const handleView = (record: MedicalRecord) => {
    setViewingRecord(record);
    setActiveMenuId(null);
  };

  const handleDownload = async (record: MedicalRecord) => {
    if (!record.fileUrl) {
      // If no fileUrl, try to generate PDF if it's a patient report
      const patientData = patients.find(p => p.id === record.pid || p.name === record.patientName);
      if (patientData) {
        generateAssessmentPDF(patientData);
      } else {
        alert("No document found to download.");
      }
      setActiveMenuId(null);
      return;
    }

    try {
      const response = await fetch(record.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      window.open(record.fileUrl, '_blank');
    }
    setActiveMenuId(null);
  };

  const getRecordTypeStyle = (type: MedicalRecordType) => {
    switch (type) {
      case 'X-RAY': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'MRI': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'PRESCRIPTION': return 'bg-primary/10 text-primary border-primary/20';
      case 'REPORT': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Medical Records</h1>
          <p className="text-sm font-medium text-slate-600 mt-1">
            View and manage patient medical documents and treatment history
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>Add Record</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Patient Name / PID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="relative">
            <select 
              value={recordTypeFilter}
              onChange={(e) => setRecordTypeFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All Status">Record Type</option>
              <option value="X-RAY">X-RAY</option>
              <option value="MRI">MRI</option>
              <option value="PRESCRIPTION">PRESCRIPTION</option>
              <option value="REPORT">REPORT</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="relative">
            <select 
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="All Branches">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleClearFilters}
            className="text-primary text-xs font-bold hover:underline flex items-center space-x-1"
          >
            <FilterX size={14} />
            <span>Clear filters</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#dcf4f4] text-[10px] uppercase tracking-wider text-slate-700">
                <th className="px-6 py-4 font-bold">Patient Name</th>
                <th className="px-6 py-4 font-bold">PID</th>
                <th className="px-6 py-4 font-bold">Record Type</th>
                <th className="px-6 py-4 font-bold">File Name</th>
                <th className="px-6 py-4 font-bold">Uploaded Date</th>
                <th className="px-6 py-4 font-bold">Doctor / Therapist</th>
                <th className="px-6 py-4 font-bold">Branch</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedRecords.length > 0 ? paginatedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${record.initialsBg}`}>
                        {record.initials}
                      </div>
                      <div className="font-bold text-slate-800">{record.patientName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {patients.find(p => p.id === record.pid || p.name === record.patientName)?.pid || record.pid}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getRecordTypeStyle(record.recordType)}`}>
                      {record.recordType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <File size={16} className="text-slate-400" />
                      <button 
                        onClick={() => {
                          if (record.fileUrl) {
                            window.open(record.fileUrl, '_blank');
                          } else {
                            // Find the patient to regenerate the report
                            const patientData = patients.find(p => p.id === record.pid || p.name === record.patientName);
                            if (patientData) {
                              generateAssessmentPDF(patientData);
                            } else {
                              console.error("Patient not found for record:", record);
                              alert("Clinical data not found for this record.");
                            }
                          }
                        }}
                        className="font-bold text-primary hover:text-primary/80 hover:underline transition-all cursor-pointer text-left truncate max-w-[200px]"
                        title="View Document"
                      >
                        {record.fileName}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                    {new Date(record.uploadedDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-bold">{record.doctor}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wide">
                      {record.branch || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === record.id ? null : record.id)}
                      className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {activeMenuId === record.id && (
                      <div className="absolute right-12 top-8 w-36 bg-white border border-slate-100 shadow-xl rounded-lg py-1 z-10 animate-in fade-in zoom-in duration-100">
                        <button 
                          onClick={() => handleView(record)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#dcf4f4] hover:text-[#2e8b8b] flex items-center space-x-2 transition-colors"
                        >
                          <Eye size={14} />
                          <span>View Detail</span>
                        </button>
                        <button 
                          onClick={() => handleDownload(record)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-[#dcf4f4] hover:text-[#2e8b8b] flex items-center space-x-2 transition-colors"
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                        <hr className="my-1 border-slate-50" />
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">
                    No medical records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span className="font-medium">
            Showing <span className="font-bold text-slate-700">{paginatedRecords.length}</span> of {filteredRecords.length} records
          </span>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 hover:bg-slate-200 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-600 font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 hover:bg-slate-200 rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <RecordModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecord}
      />

      {/* View Detail Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setViewingRecord(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-24 ${viewingRecord.initialsBg} flex items-end justify-between px-8 pb-4 relative`}>
              <div className="flex items-center space-x-4 translate-y-8">
                <div className={`w-20 h-20 rounded-2xl border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold ${viewingRecord.initialsBg}`}>
                  {viewingRecord.initials}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{viewingRecord.patientName}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRecordTypeStyle(viewingRecord.recordType)}`}>
                      {viewingRecord.recordType}
                    </span>
                    <span className="text-slate-500 text-xs font-medium">
                      {patients.find(p => p.id === viewingRecord.pid || p.name === viewingRecord.patientName)?.pid || viewingRecord.pid}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingRecord(null)}
                className="p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white absolute top-4 right-4"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="pt-16 px-8 pb-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor / Therapist</p>
                  <div className="flex items-center space-x-2">
                    <User size={14} className="text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">{viewingRecord.doctor}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploaded Date</p>
                  <div className="flex items-center space-x-2">
                    <Clock size={14} className="text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700">{viewingRecord.uploadedDate}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Attachment</p>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                        <File size={20} />
                      </div>
                      <div>
                        <button 
                          onClick={() => {
                            if (viewingRecord.fileUrl) {
                              window.open(viewingRecord.fileUrl, '_blank');
                            } else {
                              const patientData = patients.find(p => p.id === viewingRecord.pid || p.name === viewingRecord.patientName);
                              if (patientData) {
                                generateAssessmentPDF(patientData);
                              } else {
                                alert("Clinical data not found for this record.");
                              }
                            }
                          }}
                          className="text-sm font-bold text-slate-700 line-clamp-1 hover:text-primary hover:underline transition-all text-left"
                        >
                          {viewingRecord.fileName}
                        </button>
                        <p className="text-[10px] text-slate-400">PDF Document • 2.4 MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.open(viewingRecord.fileUrl, '_blank')}
                      className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Download size={18} />
                    </button>
                  </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button 
                  onClick={() => setViewingRecord(null)}
                  className="w-full sm:flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleDelete(viewingRecord.id)}
                  className="w-full sm:px-6 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 size={18} />
                  <span>Delete Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
