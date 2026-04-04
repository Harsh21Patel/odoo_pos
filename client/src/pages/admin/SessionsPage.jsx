import React, { useEffect, useState } from 'react';
import { sessionAPI } from '../../services/api';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionAPI.getAll()
      .then(r => setSessions(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div><h2 className="text-xl font-bold text-gray-800">POS Sessions</h2><p className="text-gray-500 text-sm">{sessions.length} sessions total</p></div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Session', 'Opened By', 'Opened At', 'Closed At', 'Total Sales', 'Orders', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : sessions.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No sessions yet</td></tr>
            ) : sessions.map(s => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">#{s._id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{s.openedBy?.name || 'N/A'}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(s.openedAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600">{s.closedAt ? new Date(s.closedAt).toLocaleString() : '—'}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">₹{s.totalSales?.toFixed(2) || '0.00'}</td>
                <td className="px-4 py-3 text-gray-600">{s.totalOrders || 0}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {s.status === 'open' ? '● Open' : 'Closed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}