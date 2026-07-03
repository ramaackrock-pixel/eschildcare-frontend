import { useState, useMemo, useEffect } from 'react';
import { Layout } from '../components/Layout';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  FileText,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  ChevronDown,
  Users,
  Wallet,
  Building,
  CheckCircle2
} from 'lucide-react';

import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { reportService } from '@/services/reportService';

export function Reports() {
  const { branches } = useAppData();
  const { user } = useAuth();
  
  const isSuperAdmin = user?.role === 'superadmin';
  const defaultFilter = isSuperAdmin ? '1Y' : 'TODAY';
  
  const [timeFilter, setTimeFilter] = useState(defaultFilter);
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [patients, setPatients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const data = await reportService.getReportData(timeFilter, selectedBranch);
        setPatients(data.patients || []);
        setInvoices(data.invoices || []);
      } catch (err) {
        console.error('Failed to fetch reports data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReportData();
  }, [timeFilter, selectedBranch]);

  const handleExportReport = () => {
    // We use the browser's native print engine to generate the PDF 
    // because it natively supports modern CSS like Tailwind v4's oklch colors and complex grid layouts.
    window.print();
  };

  // Dynamic KPI Cards - Based on filtered/fetched data
  const kpiMetrics = useMemo(() => {
    const savedTarget = localStorage.getItem('globalGoalTarget');
    const globalTarget = savedTarget ? parseInt(savedTarget, 10) : 1000000;
    const totalCollected = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const activePatients = patients.filter(p => p.status === 'ACTIVE').length;

    return [
      { label: 'Total Collected', value: `₹${totalCollected.toLocaleString('en-IN')}`, trend: 12.5, suffix: '', icon: Wallet },
      { label: 'Total Target', value: `₹${globalTarget.toLocaleString('en-IN')}`, trend: 8.4, suffix: '', icon: Activity },
      { label: 'Active Patients', value: activePatients, trend: 5.2, suffix: '', icon: Users },
      { label: 'Total Branches', value: branches.length, trend: 0, suffix: '', icon: Building }
    ];
  }, [patients, invoices, branches]);

  // Dynamic Collection vs Target (Area Chart)
  const collectionTrends = useMemo(() => {
    const monthlyData: Record<string, { collected: number; target: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get target from localStorage (same as CollectionStatus.tsx)
    const savedTarget = localStorage.getItem('globalGoalTarget');
    const globalTarget = savedTarget ? parseInt(savedTarget, 10) : 1000000;
    const monthlyTarget = globalTarget / 12; // Average monthly target

    // Initialize months
    months.forEach(m => monthlyData[m] = { collected: 0, target: monthlyTarget });

    invoices.forEach(inv => {
      if (inv.date) {
        const dateObj = new Date(inv.date);
        if (!isNaN(dateObj.getTime())) {
          const monthStr = months[dateObj.getMonth()];
          monthlyData[monthStr].collected += (inv.paidAmount || 0);
          monthlyData[monthStr].target += (inv.totalAmount || 0);
        }
      }
    });

    // Find the range of months that have data or just show last 6 months
    const currentMonth = new Date().getMonth();
    const displayMonths = [];
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      displayMonths.push(months[mIdx]);
    }

    return displayMonths.map(m => ({
      month: m,
      collected: monthlyData[m].collected,
      target: monthlyData[m].target
    }));
  }, [invoices]);

  // Dynamic Patient Demographics
  const demographicData = useMemo(() => {
    const groups = {
      'Ages 0-18': 0,
      'Ages 19-35': 0,
      'Ages 36-50': 0,
      'Ages 51-65': 0,
      'Ages 65+': 0
    };

    patients.forEach(p => {
      if (p.age !== undefined && p.age !== null && p.age !== '') {
        const age = parseInt(p.age.toString(), 10);
        if (age <= 18) groups['Ages 0-18']++;
        else if (age <= 35) groups['Ages 19-35']++;
        else if (age <= 50) groups['Ages 36-50']++;
        else if (age <= 65) groups['Ages 51-65']++;
        else groups['Ages 65+']++;
      } else {
        // Fallback for unknown age
        groups['Ages 19-35']++;
      }
    });

    return [
      { category: 'Ages 0-18', count: groups['Ages 0-18'], color: '#99f6e4' },
      { category: 'Ages 19-35', count: groups['Ages 19-35'], color: '#5eead4' },
      { category: 'Ages 36-50', count: groups['Ages 36-50'], color: '#2dd4bf' },
      { category: 'Ages 51-65', count: groups['Ages 51-65'], color: '#14b8a6' },
      { category: 'Ages 65+', count: groups['Ages 65+'], color: '#0f766e' }
    ].filter(g => g.count > 0);
  }, [patients]);

  // Dynamic Branch Analytics
  const branchAnalytics = useMemo(() => {
    // Group invoices by branch
    const branchRevenues: Record<string, number> = {};
    const branchPatientCounts: Record<string, Set<string>> = {};

    // Initialize map from branch ID or Name to 0
    branches.forEach(b => {
      branchRevenues[b.name] = 0;
      branchPatientCounts[b.name] = new Set();
    });

    invoices.forEach(inv => {
      // Find patient for this invoice
      const patient = patients.find(p => p.id === inv.pid || p.name === inv.patientName);
      if (patient) {
        // patient.branch could be a branch ID or branch Name. Try to match it.
        const branchMatch = branches.find(b => b.id === patient.branch || b.name === patient.branch);
        const branchName = branchMatch ? branchMatch.name : (patient.branch || 'Unknown');
        
        if (!branchRevenues[branchName]) branchRevenues[branchName] = 0;
        if (!branchPatientCounts[branchName]) branchPatientCounts[branchName] = new Set();

        branchRevenues[branchName] += (inv.paidAmount || 0);
        branchPatientCounts[branchName].add(patient.id);
      }
    });

    let maxRevenue = 0;
    const branchesData = Object.entries(branchRevenues).map(([branchName, revenue]) => {
      if (revenue > maxRevenue) maxRevenue = revenue;
      return {
        branch: branchName,
        revenue: revenue,
        patients: branchPatientCounts[branchName]?.size || 0
      };
    });

    // If a branch has 0 revenue and wasn't in invoices, it will still be included from the initialization above
    // Let's filter out 'Unknown' if it's 0 to be clean
    const filteredData = branchesData.filter(b => b.branch !== 'Unknown' || b.revenue > 0);

    // Sort by revenue descending
    filteredData.sort((a, b) => b.revenue - a.revenue);

    const topPerformer = filteredData.length > 0 && filteredData[0].revenue > 0 ? filteredData[0].branch : '---';

    return {
      branchesData: filteredData,
      maxRevenue: maxRevenue || 1, // prevent division by zero
      topPerformer
    };
  }, [branches, invoices, patients]);

  return (
    <Layout>
      <div className="space-y-8" id="report-content">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Analytics & Reports</h1>
            <p className="text-slate-500 mt-1">Institutional performance and clinical insights</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto print:hidden">
            
            {/* Branchwise Filter Dropdown - Only visible to superadmin */}
            {isSuperAdmin && (
              <div className="relative w-full sm:w-auto">
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full h-full"
                >
                  <option value="All Branches">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.name}>{branch.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            )}

            {/* Role-based Time Filter Dropdown - Only visible to superadmin */}
            {isSuperAdmin && (
              <div className="relative w-full sm:w-auto">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full h-full"
                >
                  <option value="1Y">1 Year</option>
                  <option value="6M">6 Months</option>
                  <option value="3M">3 Months</option>
                  <option value="TODAY">Today</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            )}

            <button 
              onClick={handleExportReport}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary hover:bg-[#4a9f9f] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 group"
            >
              <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          {kpiMetrics.map((metric, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{metric.label}</p>
                <div className={`flex items-center text-[10px] font-bold ${metric.trend < 0 ? 'text-red-500' : 'text-primary'}`}>
                  {metric.trend >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                  {Math.abs(metric.trend)}%
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <metric.icon size={20} className="text-primary" />
                <h3 className="text-2xl font-black text-slate-800">{metric.value}</h3>
                <span className="text-xs font-bold text-slate-400">{metric.suffix}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Performance - Now Collectioned vs Target */}
          <div className="xl:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800">Collection vs Target</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Actual Collections (All Branches)</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold text-slate-500">COLLECTED</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-bold text-slate-500">TARGET</span>
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={collectionTrends}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString('en-IN')}`, name === 'collected' ? 'Collected' : 'Target']}
                  />
                  <Area type="monotone" dataKey="collected" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Demographic Breakdown - Always visible */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-2">Patient Demographics</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Age Group Distribution (Live)</p>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="category"
                  >
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Branch Comparison - Now Branchwise Status Report */}
          <div className="bg-[#1e293b] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FileText size={120} className="text-white" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-xl font-black text-white">Branchwise Status Report</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-Facility Performance (In Progress)</p>
              </div>
              <div className="space-y-6 flex-grow">
                {branchAnalytics.branchesData.map((branch, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-300 uppercase">{branch.branch}</span>
                      <span className="text-xs font-black text-primary">₹{branch.revenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 group-hover:bg-primary/80"
                        style={{ width: `${(branch.revenue / branchAnalytics.maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {branchAnalytics.branchesData.length === 0 && (
                  <div className="text-slate-400 text-sm italic">No branch data available.</div>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Performer</p>
                  <p className="text-sm font-black text-white">{branchAnalytics.topPerformer}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

