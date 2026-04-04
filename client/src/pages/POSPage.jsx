import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import usePOSStore from '../store/posStore';
import { getSocket } from '../services/socket';

// POS Sub-components
import POSTopBar from '../components/pos/POSTopBar';
import FloorTableView from '../components/pos/FloorTableView';
import OrderScreen from '../components/pos/OrderScreen';
import PaymentScreen from '../components/pos/PaymentScreen';
import PaymentSuccessScreen from '../components/pos/PaymentSuccessScreen';
import SessionModal from '../components/pos/SessionModal';

export default function POSPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    currentSession, fetchSession, fetchFloors, fetchTables,
    fetchProducts, fetchCategories, view, addKitchenOrder, updateKitchenOrder
  } = usePOSStore();

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          fetchSession(), fetchFloors(), fetchTables(),
          fetchProducts(), fetchCategories()
        ]);
        setInitialized(true);
      } catch {
        toast.error('Failed to load POS data');
      }
    };
    init();

    // Socket listeners
    const socket = getSocket();
    socket.on('new-order', addKitchenOrder);
    socket.on('order-updated', updateKitchenOrder);
    return () => { socket.off('new-order'); socket.off('order-updated'); };
  }, []);

  useEffect(() => {
    if (initialized && !currentSession) {
      setShowSessionModal(true);
    }
  }, [initialized, currentSession]);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <POSTopBar onLogout={handleLogout} onGoToAdmin={() => navigate('/admin')} />

      <div className="flex-1 overflow-hidden">
        {view === 'tables' && <FloorTableView />}
        {view === 'order' && <OrderScreen />}
        {view === 'payment' && <PaymentScreen />}
        {view === 'success' && <PaymentSuccessScreen />}
      </div>

      {showSessionModal && (
        <SessionModal onClose={() => setShowSessionModal(false)} />
      )}
    </div>
  );
}