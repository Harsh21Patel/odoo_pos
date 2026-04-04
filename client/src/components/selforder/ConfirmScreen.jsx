import React, { useEffect, useState } from 'react';

export default function ConfirmScreen({ order, onTrack }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(145deg,#052e16,#064e3b,#052e16)',
      fontFamily: 'Inter, sans-serif',
      color: '#fff',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        @keyframes checkPop { 0%{transform:scale(0) rotate(-30deg);opacity:0} 60%{transform:scale(1.15) rotate(5deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.5);opacity:0} }
      `}</style>

      {/* Glow */}
      <div style={{
        position: 'absolute', width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(52,211,153,0.2) 0%,transparent 70%)',
        animation: 'ripple 2.5s ease-out infinite',
      }} />

      {/* Check */}
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: 'rgba(52,211,153,0.2)',
        border: '3px solid #34d399',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '3rem', marginBottom: '1.5rem',
        opacity: show ? 1 : 0,
        animation: show ? 'checkPop 0.6s cubic-bezier(.175,.885,.32,1.275) both' : 'none',
        zIndex: 10,
      }}>✓</div>

      {/* Order number */}
      <div style={{
        opacity: show ? 1 : 0,
        animation: show ? 'fadeUp 0.5s ease 0.4s both' : 'none',
        zIndex: 10,
      }}>
        <p style={{ margin: '0 0 0.25rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', letterSpacing: '0.1em' }}>ORDER CONFIRMED</p>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '3rem', fontWeight: 900, color: '#34d399', letterSpacing: '-1px' }}>
          #{order?.orderNumber?.replace('ORD-', '') || '----'}
        </h1>
        <p style={{ margin: '0 0 2rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          {order?.orderNumber}
        </p>

        <div style={{
          background: 'rgba(52,211,153,0.1)',
          border: '1px solid rgba(52,211,153,0.25)',
          borderRadius: 16, padding: '1rem 2rem',
          marginBottom: '2rem',
        }}>
          <p style={{ margin: '0 0 0.2rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>TOTAL PAID</p>
          <p style={{ margin: 0, fontWeight: 900, fontSize: '2rem', color: '#fff' }}>₹{order?.total?.toFixed(0) || 0}</p>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          🍳 Your order is heading to the kitchen!
        </p>

        <button
          onClick={onTrack}
          style={{
            background: '#fff', color: '#065f46',
            border: 'none', borderRadius: 999,
            padding: '0.9rem 2.5rem',
            fontWeight: 700, fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          📊 Track My Order
        </button>
      </div>
    </div>
  );
}
