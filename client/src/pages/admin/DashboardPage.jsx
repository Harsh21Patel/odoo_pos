import React, { useEffect, useState, useCallback } from 'react';
import { reportAPI } from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { jsPDF } from 'jspdf';

const DURATIONS = [
  { key: 'today', label: 'Today' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: '365days', label: '365 Days' },
  { key: 'custom', label: 'Custom' },
];

const PIE_COLORS = ['#9333ea', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setError('');
    const params = { duration };
    if (duration === 'custom' && customFrom && customTo) {
      params.from = customFrom;
      params.to = customTo;
    }
    reportAPI.getDashboard(params)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, [duration, customFrom, customTo]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ─── Export Helpers ─────────────────────────────────
  const exportXLS = () => {
    if (!data) return;
    const rows = [
      ['Dashboard Report'],
      [`Duration: ${duration}`],
      [],
      ['SUMMARY'],
      ['Total Orders', data.summary?.currOrders || 0],
      ['Revenue (INR)', data.summary?.currRevenue?.toFixed(2) || 0],
      ['Average Order (INR)', data.summary?.currAvgOrder?.toFixed(2) || 0],
      [],
      ['TOP ORDERS'],
      ['Order #', 'Session', 'Point of Sale', 'Date', 'Employee', 'Total (INR)'],
      ...(data.topOrders || []).map(o => [
        o.orderNumber, o.session, o.pos,
        new Date(o.date).toLocaleString(), o.employee, o.total?.toFixed(2)
      ]),
      [],
      ['TOP PRODUCTS'],
      ['Product', 'Qty', 'Revenue (INR)'],
      ...(data.topProducts || []).map(p => [p.name, p.qty, p.revenue?.toFixed(2)]),
      [],
      ['TOP CATEGORIES'],
      ['Category', 'Revenue (INR)'],
      ...(data.topCategories || []).map(c => [c.name, c.revenue?.toFixed(2)]),
    ];
    const csv = rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_${duration}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    const s = data.summary || {};
    let y = 16;
    const line = (text, indent = 0, bold = false) => {
      if (bold) doc.setFont('helvetica', 'bold');
      else doc.setFont('helvetica', 'normal');
      doc.text(text, 14 + indent, y);
      y += 7;
    };
    const gap = (n = 4) => { y += n; };

    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('Dashboard Report', 14, y); y += 10;
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.text(`Duration: ${duration}  |  Generated: ${new Date().toLocaleString()}`, 14, y); y += 10;

    // Summary
    doc.setFontSize(13); line('Summary', 0, true);
    doc.setFontSize(10);
    line(`Total Orders: ${s.currOrders || 0}`);
    line(`Revenue: Rs. ${(s.currRevenue || 0).toFixed(2)}`);
    line(`Average Order: Rs. ${(s.currAvgOrder || 0).toFixed(2)}`);
    gap();

    // Top Orders
    doc.setFontSize(13); line('Top Orders', 0, true); doc.setFontSize(10);
    (data.topOrders || []).forEach((o, i) => {
      line(`${i + 1}. ${o.orderNumber}  -  Rs. ${o.total?.toFixed(2)}  -  ${o.employee}  -  ${new Date(o.date).toLocaleDateString()}`);
    });
    if (!(data.topOrders || []).length) line('No orders for this period.');
    gap();

    // Top Products
    doc.setFontSize(13); line('Top Products', 0, true); doc.setFontSize(10);
    (data.topProducts || []).forEach((p, i) => {
      line(`${i + 1}. ${p.name}  |  Qty: ${p.qty}  |  Rs. ${p.revenue?.toFixed(2)}`);
    });
    if (!(data.topProducts || []).length) line('No products for this period.');
    gap();

    // Top Categories
    doc.setFontSize(13); line('Top Categories', 0, true); doc.setFontSize(10);
    (data.topCategories || []).forEach((c, i) => {
      line(`${i + 1}. ${c.name}  |  Rs. ${c.revenue?.toFixed(2)}`);
    });
    if (!(data.topCategories || []).length) line('No categories for this period.');

    doc.save(`dashboard_${duration}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // ─── Derived Values ──────────────────────────────────
  const summary = data?.summary || {};
  const calcChange = (curr, prev) => {
    if (!prev || prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };
  const changes = {
    orders: calcChange(summary.currOrders || 0, summary.prevOrders || 0),
    revenue: calcChange(summary.currRevenue || 0, summary.prevRevenue || 0),
    avg: calcChange(summary.currAvgOrder || 0, summary.prevAvgOrder || 0),
  };
  const renderDelta = (val) => {
    const isUp = val >= 0;
    return (
      <span className={`text-xs font-semibold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
        {isUp ? '↑' : '↓'} {Math.abs(val).toFixed(0)}%
        <span className="text-gray-400 font-normal ml-1">Since last period</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 text-sm">Real-time reporting based on selection.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={exportPDF}
            disabled={!data || loading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            📄 PDF
          </button>
          <button
            onClick={exportXLS}
            disabled={!data || loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            📊 Excel/CSV
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left: Duration Nav */}
        <div className="w-44 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="text-gray-400 uppercase tracking-wider text-xs font-bold mb-3">Duration</div>
            <div className="space-y-1">
              {DURATIONS.map(d => (
                <button
                  key={d.key}
                  onClick={() => setDuration(d.key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    duration === d.key
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {duration === 'custom' && (
              <div className="mt-4 space-y-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={e => setCustomTo(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs"
                  />
                </div>
                <button
                  onClick={fetchDashboard}
                  className="w-full bg-purple-600 text-white py-1.5 rounded-lg text-xs font-medium hover:bg-purple-700"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6 min-w-0">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-500">Loading data...</span>
            </div>
          )}

          {!loading && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total Orders', value: summary.currOrders || 0, format: 'num', delta: changes.orders, icon: '📋', color: 'text-gray-800' },
                  { label: 'Revenue', value: summary.currRevenue || 0, format: 'inr', delta: changes.revenue, icon: '💰', color: 'text-green-600' },
                  { label: 'Average Order', value: summary.currAvgOrder || 0, format: 'inr', delta: changes.avg, icon: '📊', color: 'text-purple-600' },
                ].map((card, i) => (
                  <div key={i} className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{card.icon}</span>
                      <div className="text-gray-500 text-sm font-medium">{card.label}</div>
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${card.color}`}>
                      {card.format === 'inr' ? `₹${card.value.toFixed(0)}` : card.value}
                    </div>
                    {renderDelta(card.delta)}
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-800 font-bold mb-4">📈 Sales Trend</h3>
                  {(data?.salesChart || []).length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                      No sales data for this period
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.salesChart} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${v}`} />
                          <ReTooltip
                            formatter={(v) => [`₹${v.toFixed(0)}`, 'Revenue']}
                            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#9333ea" strokeWidth={2} fill="url(#purpleGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Top Category Pie */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-800 font-bold mb-4">🥧 Top Selling Categories</h3>
                  {(data?.categoryChart || []).length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                      No category data for this period
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.categoryChart}
                            cx="40%"
                            outerRadius={80}
                            dataKey="revenue"
                            label={false}
                          >
                            {data.categoryChart.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <ReTooltip formatter={(v) => [`₹${v.toFixed(0)}`, 'Revenue']} contentStyle={{ borderRadius: 8 }} />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            formatter={(value, entry) => (
                              <span style={{ color: '#374151', fontSize: '12px' }}>
                                {value} <strong>{entry.payload.percent?.toFixed(0)}%</strong>
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Orders Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-gray-800 font-bold mb-4">🏆 Top Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-y border-gray-100">
                        <th className="p-4">Order #</th>
                        <th className="p-4">Session</th>
                        <th className="p-4">Point of Sale</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Employee</th>
                        <th className="p-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(data?.topOrders || []).map((o, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 text-purple-600 font-semibold">{o.orderNumber}</td>
                          <td className="p-4 text-gray-600">{o.session || '-'}</td>
                          <td className="p-4 text-gray-600">{o.pos || '-'}</td>
                          <td className="p-4 text-gray-600">{new Date(o.date).toLocaleString()}</td>
                          <td className="p-4 text-gray-600">{o.employee}</td>
                          <td className="p-4 text-right font-bold text-gray-800">₹{o.total?.toFixed(0)}</td>
                        </tr>
                      ))}
                      {(!data?.topOrders || data.topOrders.length === 0) && (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-gray-400">
                            No orders found for this period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-800 font-bold mb-4">🛍️ Top Products</h3>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500 font-semibold border-b border-gray-100">
                        <th className="pb-3">Product</th>
                        <th className="pb-3 text-center">Qty</th>
                        <th className="pb-3 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(data?.topProducts || []).map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 font-medium text-gray-800">{p.name || '-'}</td>
                          <td className="py-3 text-center text-gray-600">{p.qty}</td>
                          <td className="py-3 text-right font-bold text-gray-800">₹{p.revenue?.toFixed(0)}</td>
                        </tr>
                      ))}
                      {(!data?.topProducts || data.topProducts.length === 0) && (
                        <tr><td colSpan="3" className="py-6 text-center text-gray-400">No products found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Top Categories */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-gray-800 font-bold mb-4">📂 Top Categories</h3>
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500 font-semibold border-b border-gray-100">
                        <th className="pb-3">Category</th>
                        <th className="pb-3 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(data?.topCategories || []).map((c, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 font-medium text-gray-800">
                            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                            {c.name || '-'}
                          </td>
                          <td className="py-3 text-right font-bold text-gray-800">₹{c.revenue?.toFixed(0)}</td>
                        </tr>
                      ))}
                      {(!data?.topCategories || data.topCategories.length === 0) && (
                        <tr><td colSpan="2" className="py-6 text-center text-gray-400">No categories found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}