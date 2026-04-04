import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import usePOSStore from '../../store/posStore';

export default function PaymentScreen() {
  const {
    currentOrder, cartTotal, paymentMethod, setPaymentMethod,
    fetchUPIQR, upiQR, confirmPayment, setView
  } = usePOSStore();

  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUPI, setShowUPI] = useState(false);

  const total = currentOrder?.total || cartTotal;

  const handleSelectMethod = async (method) => {
    setPaymentMethod(method);
    if (method === 'upi') {
      setShowUPI(true);
      if (!upiQR) await fetchUPIQR();
    } else {
      setShowUPI(false);
    }
  };

  const handlePay = async () => {
    if (!paymentMethod) return toast.error('Select a payment method');
    if (paymentMethod === 'cash' && !cashReceived) return toast.error('Enter cash received');
    setLoading(true);
    try {
      await confirmPayment(paymentMethod === 'cash' ? parseFloat(cashReceived) : total);
      toast.success('Payment successful!');
    } catch (e) {
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const change = paymentMethod === 'cash' && cashReceived
    ? parseFloat(cashReceived) - total : 0;

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left: Order Summary */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          <button onClick={() => setView('order')} className="text-purple-600 hover:text-purple-800 text-sm font-medium mb-4 flex items-center gap-1">
            ← Back to Order
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-bold text-xl text-gray-800 mb-1">Payment</h2>
            <p className="text-gray-500 text-sm mb-6">Order #{currentOrder?.orderNumber}</p>

            {/* Order items */}
            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {currentOrder?.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.productName} × {item.quantity}</span>
                  <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>₹{currentOrder?.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span><span>₹{currentOrder?.taxAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                <span>Total</span><span className="text-purple-700">₹{total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cash input */}
          {paymentMethod === 'cash' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cash Received</label>
              <input
                type="number" value={cashReceived} onChange={e => setCashReceived(e.target.value)}
                placeholder="0.00" min={total}
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl text-lg font-semibold focus:outline-none focus:border-purple-500"
              />
              {change > 0 && (
                <div className="mt-3 p-3 bg-green-50 rounded-xl flex justify-between">
                  <span className="text-green-700 font-medium">Change to Return</span>
                  <span className="text-green-700 font-bold text-lg">₹{change.toFixed(2)}</span>
                </div>
              )}
              {/* Quick cash buttons */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, Math.ceil(total / 500) * 500].map(v => (
                  <button key={v} onClick={() => setCashReceived(String(v))}
                    className="py-2 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 rounded-lg text-sm font-medium transition-colors">
                    ₹{v}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Payment Methods */}
      <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col">
        <h3 className="font-semibold text-gray-800 mb-4">Payment Method</h3>

        <div className="space-y-3 flex-1">
          {[
            { id: 'cash', icon: '💵', label: 'Cash', desc: 'Pay with cash' },
            { id: 'digital', icon: '💳', label: 'Digital', desc: 'Card / Bank transfer' },
            { id: 'upi', icon: '📱', label: 'UPI / QR', desc: 'Scan & Pay' }
          ].map(method => (
            <button
              key={method.id}
              onClick={() => handleSelectMethod(method.id)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === method.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{method.label}</p>
                  <p className="text-xs text-gray-500">{method.desc}</p>
                </div>
                {paymentMethod === method.id && (
                  <span className="ml-auto w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* UPI QR Display */}
        {showUPI && upiQR && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
            <p className="text-xs text-gray-500 mb-2">Scan to pay ₹{total?.toFixed(2)}</p>
            <img src={upiQR.qrCode} alt="UPI QR" className="w-40 h-40 mx-auto rounded-lg" />
            <p className="text-xs text-gray-400 mt-2">{upiQR.upiId}</p>
          </div>
        )}

        <button
          onClick={handlePay} disabled={loading || !paymentMethod}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition-colors"
        >
          {loading ? 'Processing...' : `Confirm Payment · ₹${total?.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}