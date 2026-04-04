import React, { useEffect, useState } from 'react';

export default function SplashScreen({ table, onStart }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(145deg, #1a0a2e 0%, #2d1b69 40%, #1a0a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background orbs */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,51,234,0.25) 0%, transparent 70%)',
        animation: 'pulseOrb 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '15%', right: '10%',
        width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)',
        animation: 'pulseOrb 5s ease-in-out infinite reverse',
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        @keyframes pulseOrb { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.3);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bounceIn { 0%{opacity:0;transform:scale(.6)} 60%{transform:scale(1.05)} 100%{opacity:1;transform:scale(1)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>

      <div style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', zIndex: 10 }}>
        {/* Logo */}
        <div style={{
          fontSize: 72, marginBottom: '1rem',
          opacity: visible ? 1 : 0,
          animation: visible ? 'bounceIn 0.7s ease forwards' : 'none',
        }}>☕</div>

        {/* Brand */}
        <h1 style={{
          fontSize: '2rem', fontWeight: 900, color: '#fff',
          letterSpacing: '-0.5px', margin: '0 0 0.25rem',
          opacity: visible ? 1 : 0,
          animation: visible ? 'fadeUp 0.7s ease 0.2s both' : 'none',
        }}>POS Café</h1>

        {/* Table chip */}
        <div style={{
          display: 'inline-block',
          background: 'rgba(147,51,234,0.3)',
          border: '1px solid rgba(147,51,234,0.5)',
          borderRadius: 999,
          padding: '0.35rem 1.2rem',
          color: '#d8b4fe',
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '2.5rem',
          opacity: visible ? 1 : 0,
          animation: visible ? 'fadeUp 0.7s ease 0.35s both' : 'none',
        }}>
          Table {table?.number} · {table?.floor?.name}
        </div>

        {/* Tagline */}
        <p style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: '1rem',
          marginBottom: '3rem',
          opacity: visible ? 1 : 0,
          animation: visible ? 'fadeUp 0.7s ease 0.5s both' : 'none',
        }}>
          Browse our menu & place your order
        </p>

        {/* CTA Button */}
        <button
          onClick={onStart}
          style={{
            background: 'linear-gradient(135deg, #9333ea, #ec4899)',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '1rem 3rem',
            fontSize: '1.15rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(147,51,234,0.45)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            opacity: visible ? 1 : 0,
            animation: visible ? 'fadeUp 0.7s ease 0.65s both' : 'none',
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          🍽️ &nbsp;Order Here
        </button>

        <p style={{
          color: 'rgba(255,255,255,0.25)',
          fontSize: '0.72rem',
          marginTop: '2rem',
          opacity: visible ? 1 : 0,
          animation: visible ? 'fadeUp 0.7s ease 0.8s both' : 'none',
        }}>
          Scan · Order · Enjoy
        </p>
      </div>
    </div>
  );
}
