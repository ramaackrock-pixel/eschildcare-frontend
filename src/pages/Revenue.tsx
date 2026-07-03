import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { CollectionStatus } from '@/components/dashboard/CollectionStatus';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { useAppData } from '@/context/AppDataContext';
import { Banknote, TrendingUp, Wallet, CalendarDays, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { generateFinancialReport } from '@/utils/pdfGenerator';

export function Revenue() {
  const { invoices, branches, appointments } = useAppData();
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<'6months' | '12months'>('6months');
  const isSuperAdmin = user?.role === 'superadmin';
  const isStaff = user?.role === 'staff';

  if (isStaff) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-400">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Financial analysis and revenue data are only accessible to administrative roles. 
            If you believe this is an error, please contact your clinic administrator.
          </p>
        </div>
      </Layout>
    );
  }

  const today = new Date().toDateString();
  const todayInvoices = invoices.filter(inv => {
    try {
      return new Date(inv.date).toDateString() === today;
    } catch (e) {
      return false;
    }
  });

  const totalRevenue = invoices.reduce((acc, inv) => acc + (Number(inv.paidAmount) || 0), 0);
  const pendingRevenue = invoices.reduce((acc, inv) => acc + (Number(inv.dueAmount) || 0), 0);
  const todayRevenue = todayInvoices.reduce((acc, inv) => acc + (Number(inv.paidAmount) || 0), 0);
  const collectionRate = totalRevenue > 0 
    ? ((totalRevenue / (totalRevenue + pendingRevenue)) * 100).toFixed(1)
    : "0.0";

  const stats = [
    {
      title: 'Today\'s Revenue',
      value: `₹${(todayRevenue / 1000).toFixed(2)}K`,
      change: todayRevenue > 0 ? '+100%' : '0%',
      icon: <CalendarDays size={24} className="text-primary" />,
      bg: 'bg-primary/10',
      roles: ['superadmin', 'admin']
    },
    {
      title: 'Total Revenue',
      value: totalRevenue >= 100000 
        ? `₹${(totalRevenue / 100000).toFixed(2)}L`
        : `₹${(totalRevenue / 1000).toFixed(1)}K`,
      change: '+12.5%',
      icon: <Banknote size={24} className="text-blue-600" />,
      bg: 'bg-blue-50',
      roles: ['superadmin']
    },
    {
      title: 'Pending Collection',
      value: pendingRevenue >= 100000 
        ? `₹${(pendingRevenue / 100000).toFixed(2)}L`
        : `₹${(pendingRevenue / 1000).toFixed(1)}K`,
      change: '-2.1%',
      icon: <Wallet size={24} className="text-orange-600" />,
      bg: 'bg-orange-50',
      roles: ['superadmin']
    },
    {
      title: 'Collection Rate',
      value: `${collectionRate}%`,
      change: '+4.3%',
      icon: <TrendingUp size={24} className="text-purple-600" />,
      bg: 'bg-purple-50',
      roles: ['superadmin']
    }
  ].filter(s => s.roles.includes(user?.role || ''));

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Financial Overview</h1>
            <p className="text-slate-500 mt-1">
              {isSuperAdmin ? 'Track clinic revenue, collections, and financial trends' : 'View daily collection summary'}
            </p>
          </div>
          {user?.role === 'admin' && (
            <button className="bg-primary hover:bg-[#4a9f9f] text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20">
              Add Invoice
            </button>
          )}
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{stat.value}</h3>
            </div>
          ))}
        </div>

        {isSuperAdmin ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800">Revenue Growth</h3>
                  <select 
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value as '6months' | '12months')}
                    className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-500 px-3 py-2 focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="6months">Last 6 Months</option>
                    <option value="12months">Last 12 Months</option>
                  </select>
                </div>
                <TrendChart invoices={invoices} appointments={appointments} timeFilter={timeFilter} />
              </div>
            </div>
            <div className="lg:col-span-1">
              <CollectionStatus />
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Daily Revenue Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="font-semibold text-slate-600">Cash Collections</span>
                <span className="font-bold text-slate-800">₹45,200</span>
              </div>
              <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="font-semibold text-slate-600">Online Payments</span>
                <span className="font-bold text-slate-800">₹82,150</span>
              </div>
              <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="font-semibold text-slate-600">Insurance Pending</span>
                <span className="font-bold text-orange-600">₹12,000</span>
              </div>
            </div>
          </div>
        )}

        {isSuperAdmin && (
          <div className="bg-slate-800 rounded-3xl p-8 text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Detailed Financial Reports</h3>
              <p className="text-slate-300 max-w-md text-sm mb-6">
                Download comprehensive tax reports, branch-wise performance audits, and insurance claim summaries.
              </p>
              <button 
                onClick={() => generateFinancialReport(invoices, branches)}
                className="bg-primary hover:bg-[#4a9f9f] text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-xl shadow-primary/20"
              >
                Generate Report
              </button>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
              <TrendingUp size={300} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
