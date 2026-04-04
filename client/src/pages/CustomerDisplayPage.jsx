import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSocket } from '../services/socket';

export default function CustomerDisplayPage() {
  const { tableId } = useParams();
  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    const socket = getSocket();
    if (tableId) socket.emit('join-customer-display', tableId);

    socket.on('order-status-updated', (data) => {
      setOrder(prev => prev ? { ...prev, status: data.status } : prev);
    });
    socket.on('payment-completed', (data) => {
      setPaymentStatus('paid');
      setTimeout(() => { setOrder(null); setPaymentStatus(null); }, 5000);
    });
    socket.on('new-order', (newOrder) => {
      if (!tableId || newOrder.table === tableId) setOrder(newOrder);
    });
    socket.on('order-updated', (updatedOrder) => {
      if (!tableId || updatedOrder.table === tableId) setOrder(updatedOrder);
    });

    return () => {
      clearInterval(timer);
      socket.off('order-status-updated');
      socket.off('payment-completed');
      socket.off('new-order');
      socket.off('order-updated');
    };
  }, [tableId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col text-white">
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">☕</span>
          <div>
            <h1 className="text-2xl font-bold">Odoo POS Cafe</h1>
            <p className="text-purple-300 text-sm">Welcome! Enjoy your visit</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-light">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-purple-300 text-sm">{time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        {paymentStatus === 'paid' ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✓</span>
            </div>
            <h2 className="text-4xl font-bold mb-2">Thank You!</h2>
            <p className="text-purple-300 text-xl">Payment successful. Have a great day!</p>
          </div>
        ) : order ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 max-w-lg w-full border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Your Order</h2>
                <p className="text-purple-300">#{order.orderNumber}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                order.kitchenStatus === 'completed' ? 'bg-green-500' :
                order.kitchenStatus === 'preparing' ? 'bg-yellow-500 text-black' :
                'bg-purple-500'}`}>
                {order.kitchenStatus === 'completed' ? '✓ Ready' :
                 order.kitchenStatus === 'preparing' ? '🍳 Preparing' : '⏳ Received'}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-white/10">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    {item.variant && <p className="text-purple-300 text-sm">{item.variant}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-300">×{item.quantity}</p>
                    <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-xl font-bold pt-2">
              <span>Total</span>
              <span>₹{order.total?.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-8xl block mb-6">☕</span>
            <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
            <p className="text-purple-300 text-lg">When you're ready, your order details will appear here.</p>
            {tableId && <p className="text-purple-400 text-sm mt-4">Table: {tableId}</p>}
          </div>
        )}
      </div>
    </div>
  );
}