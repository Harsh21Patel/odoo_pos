import React, { useEffect } from 'react';
import { getSocket } from '../services/socket';
import usePOSStore from '../store/posStore';
import toast from 'react-hot-toast';

const STAGES = [
  { key: 'to-cook', label: '🔴 To Cook', next: 'preparing', nextLabel: 'Start Cooking' },
  { key: 'preparing', label: '🟡 Preparing', next: 'completed', nextLabel: 'Mark Done' },
  { key: 'completed', label: '🟢 Completed', next: null, nextLabel: null }
];

export default function KitchenPage() {
  const {
    kitchenOrders,
    fetchKitchenOrders,
    updateKitchenStatus,
    addKitchenOrder,
    updateKitchenOrder
  } = usePOSStore();

  useEffect(() => {
    fetchKitchenOrders();

    const socket = getSocket();

    // Join kitchen room
    socket.emit('join-kitchen');

    // New order received
    socket.on('new-order', (order) => {
      addKitchenOrder(order);
      toast.success(`New Order: ${order.orderNumber}`);
    });

    // Order updated
    socket.on('kitchen-status-updated', updateKitchenOrder);
    socket.on('order-updated', updateKitchenOrder);

    return () => {
      socket.off('new-order');
      socket.off('kitchen-status-updated');
      socket.off('order-updated');
    };
  }, []);

const getOrdersByStage = (stage) =>
  kitchenOrders.filter(o =>
    o.kitchenStatus === stage &&
    o.status !== 'cancelled'
  );

  const handleAdvance = async (orderId, nextStatus) => {
    try {
      await updateKitchenStatus(orderId, nextStatus);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍳</span>
          <div>
            <h1 className="text-xl font-bold">Kitchen Display System</h1>
            <p className="text-gray-400 text-xs">Real-time order tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-sm">Live</span>
          <span className="ml-4 text-gray-400 text-sm">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-3 gap-4 p-4 h-[calc(100vh-68px)]">
        {STAGES.map(stage => {
          const orders = getOrdersByStage(stage.key);

          return (
            <div key={stage.key} className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
              {/* Column header */}
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold text-sm">{stage.label}</h2>
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">
                  {orders.length}
                </span>
              </div>

              {/* Orders */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center text-gray-600 mt-8">
                    <span className="text-3xl block mb-2">✓</span>
                    <p className="text-sm">No orders</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order._id} className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-yellow-400">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Table */}
                      {order.tableName && (
                        <div className="mb-2">
                          <span className="text-xs bg-purple-800 text-purple-300 px-2 py-0.5 rounded-full">
                            Table {order.tableName}
                          </span>
                        </div>
                      )}

                      {/* Items */}
                      <ul className="space-y-1 mb-4">
                        {order.items?.map((item, i) => (
                          <li key={i} className="flex justify-between text-sm">
                            <span className={`${
                              item.kitchenStatus === 'completed'
                                ? 'line-through text-gray-500'
                                : 'text-gray-200'
                            }`}>
                              {item.productName || item.product?.name}
                            </span>
                            <span className="text-gray-400 font-medium">
                              ×{item.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Action button */}
                      {stage.next && (
                        <button
                          onClick={() => handleAdvance(order._id, stage.next)}
                          className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                            stage.key === 'to-cook'
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {stage.nextLabel} →
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}