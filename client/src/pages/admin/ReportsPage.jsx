import React, { useEffect, useState } from 'react';
import { reportAPI, sessionAPI } from '../../services/api';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '', session: '' });

  useEffect(() => {
    sessionAPI.getAll().then(r => setSessions(r.data));
    loadReport();
  }, []);

  const loadReport = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await reportAPI.getSales(params);
      setReport(data);
    } catch { }
    finally { setLoading(false); }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadReport(filters);
  };

  const handleExportCSV = () => {
    if (!report?.orders?.length) return;
    const rows = [
      ['Order#', 'Date', 'Table', 'Staff', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment'],
      ...report.orders.map(o => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleDateString(),
        o.table?.number || 'Takeaway',
        o.staff?.name || 'N/A',
        o.items?.length,
        o.subtotal?.toFixed(2),
        o.taxAmount?.toFixed(2),
        o.total?.toFixed(2),
        o.paymentMethod
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sales_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Sales Reports</h2>
          <p className="text-gray-500 text-sm">Filter and export your sales data</p>
        </div>
        <button onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
          📥 Export CSV
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex gap-3 flex-wrap items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
            <input type="date" value={filters.from} onChange={e => setFilters({...filters, from: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
            <input type="date" value={filters.to} onChange={e => setFilters({...filters, to: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Session</label>
            <select value={filters.session} onChange={e => setFilters({...filters, session: e.target.value})}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
              <option value="">All Sessions</option>
              {sessions.map(s => (
                <option key={s._id} value={s._id}>#{s._id.slice(-6).toUpperCase()} · {new Date(s.openedAt).toLocaleDateString()}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium">
            Apply Filters
          </button>
          <button type="button" onClick={() => { setFilters({ from: '', to: '', session: '' }); loadReport(); }}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-medium text-gray-600">
            Reset
          </button>
        </div>
      </form>

      {/* Summary Cards */}
      {report && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: report.summary?.totalOrders || 0, icon: '📋', color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Revenue', value: `₹${(report.summary?.totalRevenue || 0).toFixed(2)}`, icon: '💰', color: 'bg-green-50 text-green-600' },
            { label: 'Total Tax', value: `₹${(report.summary?.totalTax || 0).toFixed(2)}`, icon: '🧾', color: 'bg-yellow-50 text-yellow-600' },
            { label: 'Avg Order Value', value: report.summary?.totalOrders > 0 ? `₹${(report.summary.totalRevenue / report.summary.totalOrders).toFixed(2)}` : '₹0', icon: '📊', color: 'bg-purple-50 text-purple-600' }
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${s.color}`}>{s.icon}</div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Payment breakdown */}
      {report?.summary?.byMethod && Object.keys(report.summary.byMethod).length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">💳 Revenue by Payment Method</h3>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(report.summary.byMethod).map(([method, amount]) => (
              <div key={method} className="flex-1 min-w-32 p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 capitalize mb-1">{method}</p>
                <p className="text-xl font-bold text-gray-800">₹{amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Orders ({report?.orders?.length || 0})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Order #', 'Date', 'Table', 'Staff', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : !report?.orders?.length ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No orders found</td></tr>
              ) : report.orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-purple-700">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{order.table?.number || 'Takeaway'}</td>
                  <td className="px-4 py-3 text-gray-600">{order.staff?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{order.items?.length}</td>
                  <td className="px-4 py-3 text-gray-600">₹{order.subtotal?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600">₹{order.taxAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">₹{order.total?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      order.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                      order.paymentMethod === 'upi' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{order.paymentMethod || '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}