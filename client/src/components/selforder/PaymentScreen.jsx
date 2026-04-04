import React, { useState } from 'react';

export default function PaymentScreen({ cart, onConfirm, onBack, loading }) {
  const [method, setMethod] = useState('cash');

  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0);
  const total = subtotal;

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0f0a1e',
      fontFamily: 'Inter, sans-serif',
      color: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');`}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#1e0a3c,#2d1b69)',
        padding: '1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        borderBottom: '1px solid rgba(147,51,234,0.2)',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '1.1rem', cursor: 'pointer', padding: 0 }}>← Back</button>
        <p style={{ margin: 0, fontWeight: 700 }}>Payment</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>

        {/* Order items summary */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(147,51,234,0.15)',
          borderRadius: 16, padding: '1rem', marginBottom: '1rem',
        }}>
          <p style={{ margin: '0 0 0.75rem', fontWeight: 700, color: '#d8b4fe', fontSize: '0.85rem', letterSpacing: '0.05em' }}>ORDER SUMMARY</p>
          {cart.map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', paddingBottom: '0.5rem',
              borderBottom: i < cart.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              marginBottom: i < cart.length - 1 ? '0.5rem' : 0,
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>{item.productName}</p>
                {item.notes && <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{item.notes}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>× {item.quantity}</p>
                <p style={{ margin: 0, fontWeight: 700, color: '#c084fc' }}>₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(147,51,234,0.15),rgba(236,72,153,0.1))',
          border: '1px solid rgba(147,51,234,0.3)',
          borderRadius: 16, padding: '1rem', marginBottom: '1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'rgba(255,255,255,0.7)' }}>Total Amount</span>
          <span style={{ fontWeight: 900, fontSize: '1.5rem', color: '#f0abfc' }}>₹{total.toFixed(0)}</span>
        </div>

        {/* Payment method */}
        <p style={{ margin: '0 0 0.6rem', fontWeight: 700, color: '#d8b4fe', fontSize: '0.85rem', letterSpacing: '0.05em' }}>PAYMENT METHOD</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'cash', label: 'Cash', icon: '💵', sub: 'Pay at counter' },
            { id: 'upi', label: 'UPI', icon: '📱', sub: 'PhonePe / GPay' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setMethod(opt.id)}
              style={{
                background: method === opt.id
                  ? 'linear-gradient(135deg,rgba(147,51,234,0.4),rgba(236,72,153,0.3))'
                  : 'rgba(255,255,255,0.04)',
                border: method === opt.id
                  ? '2px solid rgba(147,51,234,0.7)'
                  : '2px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '1rem 0.75rem',
                cursor: 'pointer', textAlign: 'center',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>{opt.icon}</div>
              <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{opt.label}</p>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{opt.sub}</p>
            </button>
          ))}
        </div>

        {method === 'upi' && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(147,51,234,0.2)',
            borderRadius: 16, padding: '1rem', marginBottom: '1rem',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
              📱 Show this order to the counter for UPI payment, or ask staff to generate UPI QR.
            </p>
          </div>
        )}
      </div>

      {/* Confirm button */}
      <div style={{ padding: '1rem', background: '#150d2e', borderTop: '1px solid rgba(147,51,234,0.2)' }}>
        <button
          onClick={() => onConfirm(method)}
          disabled={loading}
          style={{
            width: '100%',
            background: loading ? 'rgba(147,51,234,0.3)' : 'linear-gradient(135deg,#9333ea,#ec4899)',
            color: '#fff', border: 'none', borderRadius: 999,
            padding: '0.95rem', fontWeight: 700, fontSize: '1rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(147,51,234,0.45)',
            fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
          }}
        >
          {loading ? '⏳ Placing Order...' : '✅ Confirm Order'}
        </button>
      </div>
    </div>
  );
}
