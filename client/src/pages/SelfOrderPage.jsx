import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { selfOrderAPI, paymentAPI } from '../services/api';
import { loadRazorpay } from '../utils/loadRazorpay';

import SplashScreen from '../components/selforder/SplashScreen';
import MenuScreen from '../components/selforder/MenuScreen';
import CustomizeScreen from '../components/selforder/CustomizeScreen';
import PaymentScreen from '../components/selforder/PaymentScreen';
import ConfirmScreen from '../components/selforder/ConfirmScreen';
import TrackingScreen from '../components/selforder/TrackingScreen';

const SCREENS = ['splash', 'menu', 'customize', 'payment', 'confirm', 'tracking'];

export default function SelfOrderPage() {
  const { token } = useParams();

  // Data
  const [table, setTable] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [placedOrder, setPlacedOrder] = useState(null);

  // UI state
  const [screen, setScreen] = useState('splash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // Load menu from token
  const loadMenu = useCallback(async () => {
    try {
      const res = await selfOrderAPI.getMenu(token);
      setTable(res.data.table);
      setProducts(res.data.products);
      setCategories(res.data.categories);
    } catch (e) {
      setError(e.response?.data?.message || 'Invalid or expired QR code.');
    } finally {
      setInitialLoad(false);
    }
  }, [token]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // ── Cart helpers ──────────────────────────────
  const addToCart = (product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product === product._id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, {
        product: product._id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        notes: '',
        variants: product.variants || [],
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.product === productId);
      if (idx < 0) return prev;
      const updated = [...prev];
      if (updated[idx].quantity > 1) {
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity - 1 };
      } else {
        updated.splice(idx, 1);
      }
      return updated;
    });
  };

  const updateCartItem = (productId, changes) => {
    setCart(prev => prev.map(i =>
      i.product === productId ? { ...i, ...changes } : i
    ));
  };

  // ── Place order ───────────────────────────────
  const placeOrder = async (paymentMethod) => {
    setLoading(true);
    try {
      const res = await selfOrderAPI.placeOrder(token, {
        items: cart.map(i => ({
          product: i.product,
          productName: i.productName,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes,
        })),
        paymentMethod,
        notes: '',
      });
      const order = res.data;

      if (paymentMethod === 'upi' || paymentMethod === 'digital') {
        const loaded = await loadRazorpay();
        if (!loaded) {
          alert('Failed to load Razorpay SDK');
          setPlacedOrder(order);
          setScreen('confirm');
          return;
        }

        const { data: { keyId } } = await paymentAPI.getRazorpayKey();
        const rzpRes = await paymentAPI.createRazorpayOrder({ orderId: order._id });
        const rzpOrder = rzpRes.data;

        const options = {
          key: keyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "Odoo POS Cafe",
          description: `Order #${order.orderNumber || ''}`,
          order_id: rzpOrder.id,
          handler: async function (response) {
            setLoading(true);
            try {
              await paymentAPI.verifyRazorpayPayment({
                orderId: order._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                method: paymentMethod
              });
              setPlacedOrder({ ...order, status: 'paid', paymentMethod });
              setScreen('confirm');
            } catch (err) {
              alert('Payment verification failed');
              setPlacedOrder(order);
              setScreen('confirm');
            } finally {
              setLoading(false);
            }
          },
          theme: { color: "#ec4899" }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function () {
          alert("Online payment failed. You can pay via cash at the counter.");
          setPlacedOrder({ ...order, paymentMethod: 'cash' });
          setScreen('confirm');
        });
        rzp.open();
      } else {
        setPlacedOrder(order);
        setScreen('confirm');
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      // Don't turn off loading for razorpay yet, handler will turn it off, or modal is open.
      if (paymentMethod !== 'upi' && paymentMethod !== 'digital') {
        setLoading(false);
      }
    }
  };

  // ── Loading / Error states ────────────────────
  if (initialLoad) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: 'linear-gradient(145deg,#1a0a2e,#2d1b69)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>☕</div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading menu…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100dvh',
        background: '#0f0a1e',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif', color: '#fff', textAlign: 'center', padding: '2rem',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ margin: '0 0 0.5rem' }}>Oops!</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>{error}</p>
        <button
          onClick={loadMenu}
          style={{
            background: 'linear-gradient(135deg,#9333ea,#ec4899)',
            color: '#fff', border: 'none', borderRadius: 999,
            padding: '0.75rem 2rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
          }}
        >Retry</button>
      </div>
    );
  }

  // ── Screen router ─────────────────────────────
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {screen === 'splash' && (
        <SplashScreen table={table} onStart={() => setScreen('menu')} />
      )}

      {screen === 'menu' && (
        <MenuScreen
          table={table}
          products={products}
          categories={categories}
          cart={cart}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onNext={() => setScreen('customize')}
          onBack={() => setScreen('splash')}
        />
      )}

      {screen === 'customize' && (
        <CustomizeScreen
          cart={cart}
          onUpdate={updateCartItem}
          onNext={() => setScreen('payment')}
          onBack={() => setScreen('menu')}
        />
      )}

      {screen === 'payment' && (
        <PaymentScreen
          cart={cart}
          onConfirm={placeOrder}
          onBack={() => setScreen('customize')}
          loading={loading}
        />
      )}

      {screen === 'confirm' && placedOrder && (
        <ConfirmScreen
          order={placedOrder}
          onTrack={() => setScreen('tracking')}
        />
      )}

      {screen === 'tracking' && placedOrder && (
        <TrackingScreen
          orderId={placedOrder._id}
          initialOrder={placedOrder}
          onBack={() => {
            // Reset for a new order
            setCart([]);
            setPlacedOrder(null);
            setScreen('menu');
          }}
        />
      )}
    </>
  );
}
