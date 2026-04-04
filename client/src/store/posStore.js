import { create } from 'zustand';
import { orderAPI, sessionAPI, tableAPI, floorAPI, productAPI, categoryAPI } from '../services/api';

const usePOSStore = create((set, get) => ({
  // Session
  currentSession: null,
  sessionLoading: false,

  // Floor/Tables
  floors: [],
  tables: [],
  selectedFloor: null,
  selectedTable: null,

  // Products
  products: [],
  categories: [],
  selectedCategory: null,

  // Active order (cart)
  currentOrder: null,
  cart: [],      // { product, productName, quantity, price, variant, notes }
  cartTotal: 0,
  cartSubtotal: 0,
  cartTax: 0,

  // UI state
  view: 'tables',    // 'tables' | 'order' | 'payment' | 'success'
  paymentMethod: '',
  upiQR: null,
  paymentResult: null,

  // Kitchen orders
  kitchenOrders: [],

  // ─── Session ───────────────────────────────────────────────
  fetchSession: async () => {
    set({ sessionLoading: true });
    try {
      const { data } = await sessionAPI.getCurrent();
      set({ currentSession: data, sessionLoading: false });
    } catch {
      set({ sessionLoading: false });
    }
  },

  openSession: async (openingBalance = 0) => {
    const { data } = await sessionAPI.open({ openingBalance });
    set({ currentSession: data });
    return data;
  },

  closeSession: async () => {
    await sessionAPI.close({});
    set({ currentSession: null });
  },

  // ─── Floors & Tables ───────────────────────────────────────
  fetchFloors: async () => {
    const { data } = await floorAPI.getAll();
    set({ floors: data, selectedFloor: data[0]?._id || null });
  },

  fetchTables: async () => {
    const { data } = await tableAPI.getAll();
    set({ tables: data });
  },

  selectFloor: (floorId) => set({ selectedFloor: floorId }),

  selectTable: (table) => {
    set({ selectedTable: table, view: 'order', cart: [], currentOrder: null });
  },

  // ─── Products & Categories ─────────────────────────────────
  fetchProducts: async () => {
    const { data } = await productAPI.getAll({ active: true });
    set({ products: data });
  },

  fetchCategories: async () => {
    const { data } = await categoryAPI.getAll();
    set({ categories: data, selectedCategory: null });
  },

  selectCategory: (catId) => set({ selectedCategory: catId }),

  // ─── Cart Operations ───────────────────────────────────────
  addToCart: (product, variant = '', quantity = 1) => {
    const cart = get().cart;
    const key = `${product._id}-${variant}`;
    const existing = cart.find(i => `${i.product._id}-${i.variant}` === key);

    let newCart;
    if (existing) {
      newCart = cart.map(i =>
        `${i.product._id}-${i.variant}` === key
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      newCart = [...cart, {
        product,
        productName: product.name,
        quantity,
        price: product.price,
        tax: product.tax || 0,
        variant,
        notes: ''
      }];
    }

    get().recalculate(newCart);
    set({ cart: newCart });
  },

  removeFromCart: (index) => {
    const newCart = get().cart.filter((_, i) => i !== index);
    get().recalculate(newCart);
    set({ cart: newCart });
  },

  updateCartQty: (index, qty) => {
    if (qty <= 0) return get().removeFromCart(index);
    const newCart = get().cart.map((item, i) =>
      i === index ? { ...item, quantity: qty } : item
    );
    get().recalculate(newCart);
    set({ cart: newCart });
  },

  updateCartNote: (index, notes) => {
    const newCart = get().cart.map((item, i) =>
      i === index ? { ...item, notes } : item
    );
    set({ cart: newCart });
  },

  clearCart: () => {
    set({ cart: [], cartTotal: 0, cartSubtotal: 0, cartTax: 0 });
  },

  recalculate: (cart) => {
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = cart.reduce((sum, i) => sum + (i.price * i.quantity * (i.tax || 0)) / 100, 0);
    set({ cartSubtotal: subtotal, cartTax: tax, cartTotal: subtotal + tax });
  },

  // ─── Order Operations ──────────────────────────────────────
  placeOrder: async () => {
    const { cart, selectedTable, currentSession, cartTotal, cartSubtotal, cartTax } = get();
    if (!cart.length) return;

    const items = cart.map(i => ({
      product: i.product._id,
      productName: i.productName,
      quantity: i.quantity,
      price: i.price,
      tax: i.tax,
      variant: i.variant,
      notes: i.notes
    }));

    const { data } = await orderAPI.create({
      tableId: selectedTable?._id,
      tableName: selectedTable?.number,
      sessionId: currentSession?._id,
      items,
      subtotal: cartSubtotal,
      taxAmount: cartTax,
      total: cartTotal
    });

    set({ currentOrder: data });
    return data;
  },

  // ─── Payment ───────────────────────────────────────────────
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  fetchUPIQR: async () => {
    const { currentOrder } = get();
    if (!currentOrder) return;
    const { data } = await orderAPI.getUPIQR(currentOrder._id);
    set({ upiQR: data });
    return data;
  },

  confirmPayment: async (cashReceived) => {
    const { currentOrder, paymentMethod } = get();
    if (!currentOrder) return;

    const payload = { method: paymentMethod };
    if (paymentMethod === 'cash') payload.cashReceived = cashReceived;

    const { data } = await orderAPI.processPayment(currentOrder._id, payload);
    set({ paymentResult: data, view: 'success' });

    // Update table status locally
    set(state => ({
      tables: state.tables.map(t =>
        t._id === state.selectedTable?._id ? { ...t, status: 'available' } : t
      )
    }));

    return data;
  },

  resetPOS: () => {
    set({
      selectedTable: null,
      cart: [],
      cartTotal: 0,
      cartSubtotal: 0,
      cartTax: 0,
      currentOrder: null,
      paymentMethod: '',
      upiQR: null,
      paymentResult: null,
      view: 'tables'
    });
  },

  setView: (view) => set({ view }),

 fetchKitchenOrders: async () => {
  const { data } = await orderAPI.getAll();

  // Only keep orders that belong to kitchen
  const kitchenOrders = data.filter(order =>
    order.kitchenStatus && order.status !== 'cancelled'
  );

  set({ kitchenOrders });
},

  updateKitchenStatus: async (orderId, status, itemId) => {
    const { data } = await orderAPI.updateKitchen(orderId, { status, itemId });
    set(state => ({
      kitchenOrders: state.kitchenOrders.map(o => o._id === orderId ? data : o)
    }));
  },

  addKitchenOrder: (order) => {
    set(state => ({ kitchenOrders: [order, ...state.kitchenOrders] }));
  },

  updateKitchenOrder: (order) => {
    set(state => ({
      kitchenOrders: state.kitchenOrders.map(o => o._id === order._id ? order : o)
    }));
  }
}));

export default usePOSStore;