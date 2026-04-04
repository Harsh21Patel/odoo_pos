import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import usePOSStore from '../../store/posStore';

export default function POSTopBar({ onLogout, onGoToAdmin }) {
  const { user } = useAuthStore();
  const { currentSession, fetchTables, fetchProducts, fetchCategories, fetchFloors, setView, resetPOS } = usePOSStore();
  const navigate = useNavigate();

  const handleReload = async () => {
    await Promise.all([fetchTables(), fetchProducts(), fetchCategories(), fetchFloors()]);
  };

  return (
    <div className="bg-purple-800 text-white px-4 py-2 flex items-center justify-between shadow-lg z-10">
      {/* Left: Logo & session */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">☕</span>
          <span className="font-bold text-lg">Odoo POS Cafe</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${currentSession ? 'bg-green-500' : 'bg-red-500'}`}>
          {currentSession ? `Session #${currentSession._id?.slice(-4).toUpperCase()}` : 'No Session'}
        </div>
      </div>

      {/* Center: Nav buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => { resetPOS(); setView('tables'); }}
          className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          🪑 Table View
        </button>
        <button
          onClick={handleReload}
          className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          🔄 Reload
        </button>
        <button
          onClick={() => navigate('/kitchen')}
          className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          🍳 Kitchen
        </button>
        {user?.role === 'admin' && (
          <button
            onClick={onGoToAdmin}
            className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            ⚙️ Backend
          </button>
        )}
      </div>

      {/* Right: User & close */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs font-medium">{user?.name}</p>
          <p className="text-xs text-purple-300 capitalize">{user?.role}</p>
        </div>
        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-medium transition-colors"
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}