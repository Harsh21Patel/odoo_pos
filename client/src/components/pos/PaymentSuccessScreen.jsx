// PaymentSuccessScreen.jsx
import React from 'react';
import usePOSStore from '../../store/posStore';

export default function PaymentSuccessScreen() {
  const { paymentResult, resetPOS } = usePOSStore();
  const order = paymentResult?.order;

  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 mb-6">Order #{order?.orderNumber}</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount Paid</span>
            <span className="font-bold text-gray-800">₹{order?.total?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payment Method</span>
            <span className="font-medium capitalize">{order?.paymentMethod}</span>
          </div>
          {paymentResult?.changeGiven > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Change Returned</span>
              <span className="font-medium text-green-600">₹{paymentResult.changeGiven?.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetPOS}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            New Order
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-semibold text-gray-700 transition-colors"
          >
            🖨️ Print
          </button>
        </div>
      </div>
    </div>
  );
}