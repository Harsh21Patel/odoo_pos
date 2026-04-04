import React, { useState } from 'react';
import toast from 'react-hot-toast';
import usePOSStore from '../../store/posStore';

export default function SessionModal({ onClose }) {
  const { openSession, currentSession } = usePOSStore();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      await openSession(parseFloat(balance) || 0);
      toast.success('Session opened successfully!');
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to open session');
    } finally {
      setLoading(false);
    }
  };

  if (currentSession) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">🏪</span>
          <h2 className="text-xl font-bold text-gray-800">Open POS Session</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your opening cash balance to begin</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Opening Balance (₹)</label>
          <input
            type="number" value={balance} onChange={e => setBalance(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:border-purple-500 text-center"
            placeholder="0.00" min="0"
          />
        </div>

        <button
          onClick={handleOpen} disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          {loading ? 'Opening...' : 'Open Session'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          You can always close the session from the register menu
        </p>
      </div>
    </div>
  );
}