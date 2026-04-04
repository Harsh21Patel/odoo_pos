import React, { useEffect, useState } from 'react';
import { reportAPI } from '../../services/api';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const stats = [
    { label: "Today's Orders", value: data?.todayOrders || 0, icon: '📋', color: 'bg-blue-50 text-blue-600' },
    { label: "Today's Revenue", value: `₹${(data?.todayRevenue || 0).toFixed(0)}`, icon: '💰', color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders (All)', value: data?.totalOrders || 0, icon: '📊', color: 'bg-purple-50 text-purple-600' },
    { label: 'Payment Methods', value: data?.paymentBreakdown?.length || 0, icon: '💳', color: 'bg-orange-50 text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">🏆 Top Products Today</h3>
          {data?.topProducts?.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No sales today yet</p>
          )}
          <div className="space-y-3">
            {(data?.topProducts || []).map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{p._id || 'Unknown'}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">₹{p.revenue?.toFixed(0)}</p>
                  <p className="text-xs text-gray-500">{p.quantity} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">💳 Payment Breakdown</h3>
          {data?.paymentBreakdown?.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">No payments today yet</p>
          )}
          <div className="space-y-3">
            {(data?.paymentBreakdown || []).map((p, i) => {
              const colors = { cash: 'bg-green-100 text-green-700', digital: 'bg-blue-100 text-blue-700', upi: 'bg-purple-100 text-purple-700' };
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[p._id] || 'bg-gray-200 text-gray-700'}`}>{p._id}</span>
                    <span className="text-sm text-gray-600">{p.count} transactions</span>
                  </div>
                  <span className="font-bold text-gray-800">₹{p.total?.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last 7 days */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">📈 Last 7 Days Revenue</h3>
          <div className="flex items-end gap-2 h-32">
            {(data?.last7Days || []).map((d, i) => {
              const max = Math.max(...(data?.last7Days || []).map(x => x.revenue), 1);
              const pct = (d.revenue / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">₹{d.revenue?.toFixed(0)}</span>
                  <div className="w-full bg-purple-500 rounded-t-md" style={{ height: `${Math.max(pct, 4)}%` }}></div>
                  <span className="text-xs text-gray-400">{d._id?.slice(5)}</span>
                </div>
              );
            })}
            {(!data?.last7Days || data.last7Days.length === 0) && (
              <p className="text-gray-400 text-sm w-full text-center">No revenue data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}