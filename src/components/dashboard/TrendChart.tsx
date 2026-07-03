import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

export function TrendChart({ invoices = [], appointments = [], timeFilter = '6months' }: any) {
  const data = useMemo(() => {
    const months = timeFilter === '6months' ? 6 : 12;
    const now = new Date();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' }).toUpperCase();
      
      // Filter invoices for this month
      const monthInvoices = invoices.filter((inv: any) => {
        const invDate = new Date(inv.date);
        return invDate.getFullYear() === d.getFullYear() && invDate.getMonth() === d.getMonth();
      });

      // Sum revenue
      const revenue = monthInvoices.reduce((acc: number, inv: any) => acc + (Number(inv.paidAmount) || 0), 0);

      // Filter appointments for this month (only COMPLETED)
      const monthAppointments = appointments.filter((app: any) => {
        if (app.status !== 'COMPLETED') return false;
        if (!app.appointmentDate) return false;
        const appDate = new Date(app.appointmentDate);
        return appDate.getFullYear() === d.getFullYear() && appDate.getMonth() === d.getMonth();
      });

      result.push({
        name: monthName,
        revenue,
        visits: monthAppointments.length
      });
    }

    return result;
  }, [invoices, appointments, timeFilter]);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm col-span-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 cursor-pointer group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Visits & Revenue Trend</h2>
          <p className="text-sm text-slate-500">Comparison between patient intake and daily billing.</p>
        </div>
        <div className="flex items-center space-x-4 text-sm font-medium text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#1e78b4]"></span>
            <span>Revenue (₹)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-[#82cae3]"></span>
            <span>Visits</span>
          </div>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#1e78b4"
              strokeWidth={3}
              dot={{ r: 4, fill: '#1e78b4', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="#82cae3"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
