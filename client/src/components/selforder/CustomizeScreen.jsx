import React, { useState } from 'react';

export default function CustomizeScreen({ cart, onUpdate, onNext, onBack }) {
  const [notes, setNotes] = useState(() => {
    const n = {};
    cart.forEach(item => { n[item.product] = item.notes || ''; });
    return n;
  });

  const total = cart.reduce((a, i) => a + i.price * i.quantity, 0);

  const handleNoteChange = (productId, val) => {
    setNotes(prev => ({ ...prev, [productId]: val }));
    onUpdate(productId, { notes: val });
  };

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
        <div>
          <p style={{ margin: 0, fontWeight: 700 }}>Customize Order</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {cart.map((item) => (
          <div key={item.product} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(147,51,234,0.2)',
            borderRadius: 16, padding: '1rem', marginBottom: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div>
                <p style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '0.95rem' }}>{item.productName}</p>
                <p style={{ margin: 0, color: '#c084fc', fontSize: '0.85rem' }}>× {item.quantity} · ₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
              <span style={{
                background: 'rgba(147,51,234,0.25)',
                borderRadius: 999, padding: '0.2rem 0.7rem',
                fontSize: '0.75rem', color: '#d8b4fe', alignSelf: 'flex-start',
              }}>₹{item.price} ea</span>
            </div>

            {/* Variant chips */}
            {item.variants && item.variants.length > 0 && (
              <div style={{ marginBottom: '0.5rem' }}>
                <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>VARIANT</p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {item.variants.map(v => (
                    <span key={v} style={{
                      padding: '0.25rem 0.7rem', borderRadius: 999,
                      fontSize: '0.75rem', fontWeight: 600,
                      background: 'rgba(236,72,153,0.2)', color: '#f9a8d4',
                      border: '1px solid rgba(236,72,153,0.3)',
                    }}>{v}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes input */}
            <div>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>SPECIAL NOTES (optional)</p>
              <textarea
                value={notes[item.product] || ''}
                onChange={e => handleNoteChange(item.product, e.target.value)}
                placeholder="E.g. no onions, extra spicy…"
                rows={2}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(147,51,234,0.3)',
                  borderRadius: 10, padding: '0.5rem 0.75rem',
                  color: '#fff', fontSize: '0.82rem', resize: 'none',
                  outline: 'none', fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        background: '#150d2e',
        borderTop: '1px solid rgba(147,51,234,0.2)',
        padding: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Total</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{total.toFixed(0)}</span>
        </div>
        <button
          onClick={onNext}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg,#9333ea,#ec4899)',
            color: '#fff', border: 'none', borderRadius: 999,
            padding: '0.9rem', fontWeight: 700, fontSize: '1rem',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(147,51,234,0.4)',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
