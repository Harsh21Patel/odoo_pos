import React, { useEffect, useState, useCallback } from 'react';
import { selfOrderAPI } from '../../services/api';

const POLL_MS = 5000;

const STATUS_MAP = {
  'to-cook':   { label: 'To Cook',   color: '#fb923c', bg: 'rgba(251,146,60,0.15)',  icon: '🔥', step: 1 },
  pending:     { label: 'Pending',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  icon: '⏳', step: 0 },
  preparing:   { label: 'Preparing', color: '#facc15', bg: 'rgba(250,204,21,0.15)',  icon: '👨‍🍳', step: 2 },
  completed:   { label: 'Completed', color: '#34d399', bg: 'rgba(52,211,153,0.15)', icon: '✅', step: 3 },
  ready:       { label: 'Ready',     color: '#34d399', bg: 'rgba(52,211,153,0.15)', icon: '🍽️',  step: 3 },
};

export default function TrackingScreen({ orderId, initialOrder, onBack }) {
  const [order, setOrder] = useState(initialOrder);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStatus = useCallback(async () => {
    try {
      const res = await selfOrderAPI.getOrderStatus(orderId);
      setOrder(res.data);
      setLastUpdated(new Date());
    } catch (e) {
      // silently fail and retry
    }
  }, [orderId]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const kStatus = order?.kitchenStatus || 'pending';
  const statusInfo = STATUS_MAP[kStatus] || STATUS_MAP.pending;
  const done = kStatus === 'completed' || kStatus === 'ready';

  const steps = [
    { label: 'Order Received', icon: '📋', step: 0 },
    { label: 'In Queue',       icon: '🔥', step: 1 },
    { label: 'Preparing',      icon: '👨‍🍳', step: 2 },
    { label: 'Ready!',         icon: '✅', step: 3 },
  ];

  const currentStep = statusInfo.step;

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0f0a1e',
      fontFamily: 'Inter, sans-serif',
      color: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg,#1e0a3c,#2d1b69)',
        padding: '1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        borderBottom: '1px solid rgba(147,51,234,0.2)',
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '1.1rem', cursor: 'pointer', padding: 0 }}>← Back</button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Order History</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
            {order?.orderNumber} · Updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        {/* Live pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: done ? '#34d399' : '#fb923c',
            animation: done ? 'none' : 'pulse 1.5s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>LIVE</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>

        {/* Current status card */}
        <div style={{
          background: statusInfo.bg,
          border: `1px solid ${statusInfo.color}40`,
          borderRadius: 20, padding: '1.5rem',
          textAlign: 'center', marginBottom: '1.5rem',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{statusInfo.icon}</div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>KITCHEN STATUS</p>
          <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.8rem', fontWeight: 900, color: statusInfo.color }}>
            {statusInfo.label}
          </h2>
          {!done && (
            <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', animation: 'pulse 2s ease-in-out infinite' }}>
              Refreshing every 5 seconds…
            </p>
          )}
          {done && (
            <p style={{ margin: '0.5rem 0 0', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
              🎉 Your order is ready! Enjoy your meal.
            </p>
          )}
        </div>

        {/* Progress stepper */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(147,51,234,0.15)',
          borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem',
        }}>
          <p style={{ margin: '0 0 1rem', fontWeight: 700, color: '#d8b4fe', fontSize: '0.82rem', letterSpacing: '0.05em' }}>PROGRESS</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute', top: 18, left: '12.5%', right: '12.5%', height: 2,
              background: 'rgba(255,255,255,0.1)', zIndex: 0,
            }} />
            <div style={{
              position: 'absolute', top: 18, left: '12.5%',
              width: `${Math.min(100, (currentStep / 3) * 100)}%`, height: 2,
              background: 'linear-gradient(90deg,#9333ea,#ec4899)',
              transition: 'width 1s ease', zIndex: 1,
            }} />

            {steps.map((s) => {
              const done = currentStep >= s.step;
              const active = currentStep === s.step;
              return (
                <div key={s.step} style={{ textAlign: 'center', width: '25%', position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    margin: '0 auto 0.4rem',
                    background: done
                      ? 'linear-gradient(135deg,#9333ea,#ec4899)'
                      : 'rgba(255,255,255,0.08)',
                    border: active ? '2px solid #c084fc' : '2px solid transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', transition: 'all 0.4s',
                    boxShadow: active ? '0 0 12px rgba(192,132,252,0.5)' : 'none',
                  }}>
                    {s.icon}
                  </div>
                  <p style={{
                    margin: 0, fontSize: '0.65rem',
                    color: done ? '#d8b4fe' : 'rgba(255,255,255,0.3)',
                    fontWeight: done ? 600 : 400,
                    lineHeight: 1.2,
                  }}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order items */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(147,51,234,0.15)',
          borderRadius: 16, padding: '1rem',
        }}>
          <p style={{ margin: '0 0 0.75rem', fontWeight: 700, color: '#d8b4fe', fontSize: '0.82rem', letterSpacing: '0.05em' }}>YOUR ORDER · {order?.orderNumber}</p>
          {order?.items?.map((item, i) => {
            const itemStatus = STATUS_MAP[item.kitchenStatus] || STATUS_MAP.pending;
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.6rem 0',
                borderBottom: i < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>{item.productName}</p>
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                    × {item.quantity} · ₹{(item.price * item.quantity).toFixed(0)}
                  </p>
                </div>
                <span style={{
                  padding: '0.2rem 0.7rem', borderRadius: 999,
                  fontSize: '0.7rem', fontWeight: 700,
                  background: itemStatus.bg, color: itemStatus.color,
                  border: `1px solid ${itemStatus.color}40`,
                  whiteSpace: 'nowrap',
                }}>
                  {itemStatus.icon} {itemStatus.label}
                </span>
              </div>
            );
          })}

          <div style={{
            marginTop: '0.75rem', paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 600 }}>Total</span>
            <span style={{ fontWeight: 900, fontSize: '1rem', color: '#f0abfc' }}>₹{order?.total?.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Back */}
      <div style={{ padding: '1rem', background: '#150d2e', borderTop: '1px solid rgba(147,51,234,0.2)' }}>
        <button
          onClick={onBack}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.06)',
            color: '#d8b4fe', border: '1px solid rgba(147,51,234,0.3)',
            borderRadius: 999, padding: '0.85rem',
            fontWeight: 600, fontSize: '0.95rem',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >← Back to Menu</button>
      </div>
    </div>
  );
}
