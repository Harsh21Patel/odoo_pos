import React, { useState } from 'react';

const S = {
  wrap: {
    minHeight: '100dvh',
    background: '#0f0a1e',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    color: '#fff',
  },
  header: {
    background: 'linear-gradient(135deg,#1e0a3c,#2d1b69)',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderBottom: '1px solid rgba(147,51,234,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 20,
  },
};

export default function MenuScreen({ table, products, categories, cart, onAdd, onRemove, onNext, onBack }) {
  const [selectedCat, setSelectedCat] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => {
    const mc = !selectedCat || p.category?._id === selectedCat;
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const totalQty = cart.reduce((a, i) => a + i.quantity, 0);
  const totalAmt = cart.reduce((a, i) => a + i.price * i.quantity, 0);

  const cartQty = (productId) => {
    const item = cart.find(i => i.product === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div style={S.wrap}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');`}</style>

      {/* Header */}
      <div style={S.header}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '1.1rem', cursor: 'pointer', padding: 0 }}>← Back</button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Table {table?.number}</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{table?.floor?.name}</p>
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search..."
          style={{
            padding: '0.4rem 0.75rem', borderRadius: 999,
            border: '1px solid rgba(147,51,234,0.4)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff', fontSize: '0.8rem', outline: 'none', width: 130,
          }}
        />
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem',
        overflowX: 'auto', background: '#150d2e',
        borderBottom: '1px solid rgba(147,51,234,0.15)',
        scrollbarWidth: 'none',
      }}>
        <CategoryChip label="All" active={!selectedCat} onClick={() => setSelectedCat(null)} />
        {categories.map(cat => (
          <CategoryChip
            key={cat._id} label={`${cat.icon || ''} ${cat.name}`}
            active={selectedCat === cat._id} onClick={() => setSelectedCat(cat._id)}
          />
        ))}
      </div>

      {/* Product grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', paddingBottom: totalQty > 0 ? '6rem' : '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: '3rem' }}>🔍</div>
            <p>No items found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {filtered.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                qty={cartQty(product._id)}
                onAdd={() => onAdd(product)}
                onRemove={() => onRemove(product._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky cart bar */}
      {totalQty > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(135deg,#7c3aed,#db2777)',
          padding: '0.9rem 1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 -4px 24px rgba(147,51,234,0.5)',
          zIndex: 30,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>{totalQty} {totalQty === 1 ? 'item' : 'items'}</p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>₹{totalAmt.toFixed(0)}</p>
          </div>
          <button
            onClick={onNext}
            style={{
              background: '#fff', color: '#7c3aed',
              border: 'none', borderRadius: 999,
              padding: '0.6rem 1.5rem',
              fontWeight: 700, fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        whiteSpace: 'nowrap', padding: '0.4rem 1rem',
        borderRadius: 999, border: 'none', cursor: 'pointer',
        fontWeight: 600, fontSize: '0.78rem',
        background: active ? 'linear-gradient(135deg,#9333ea,#ec4899)' : 'rgba(255,255,255,0.07)',
        color: active ? '#fff' : 'rgba(255,255,255,0.6)',
        transition: 'all 0.2s',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {label}
    </button>
  );
}

function ProductCard({ product, qty, onAdd, onRemove }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: qty > 0 ? '1px solid rgba(147,51,234,0.6)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Image / Icon */}
      <div style={{
        height: 100, background: 'linear-gradient(135deg,#1e0a3c,#2d1b69)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem', overflow: 'hidden',
      }}>
        {product.image ? (
          <img
            src={product.image.startsWith('http') ? product.image : `/uploads/${product.image}`}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          product.category?.icon || '🍽️'
        )}
      </div>

      <div style={{ padding: '0.6rem' }}>
        <p style={{ margin: '0 0 0.2rem', fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.3 }}>{product.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
          <span style={{ fontWeight: 700, color: '#c084fc', fontSize: '0.9rem' }}>₹{product.price}</span>

          {qty === 0 ? (
            <button
              onClick={onAdd}
              style={{
                background: 'linear-gradient(135deg,#9333ea,#ec4899)',
                color: '#fff', border: 'none',
                borderRadius: 999, width: 28, height: 28,
                fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >+</button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <button onClick={onRemove} style={qtyBtn('#2d1b69', '#c084fc')}>−</button>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{qty}</span>
              <button onClick={onAdd} style={qtyBtn('#9333ea', '#fff')}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function qtyBtn(bg, color) {
  return {
    background: bg, color,
    border: 'none', borderRadius: 999,
    width: 24, height: 24, cursor: 'pointer',
    fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Inter, sans-serif',
  };
}
