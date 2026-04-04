import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me')
};

// Products
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (id) => API.get(`/products/${id}`),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`)
};

// Categories
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`)
};

// Orders
export const orderAPI = {
  getAll: (params) => API.get('/orders', { params }),
  getOne: (id) => API.get(`/orders/${id}`),
  create: (data) => API.post('/orders', data),
  update: (id, data) => API.put(`/orders/${id}`, data),
  updateKitchen: (id, data) => API.put(`/orders/${id}/kitchen`, data),
  processPayment: (id, data) => API.post(`/orders/${id}/payment`, data),
  getUPIQR: (id) => API.get(`/orders/${id}/upi-qr`)
};

// Tables
export const tableAPI = {
  getAll: (params) => API.get('/tables', { params }),
  create: (data) => API.post('/tables', data),
  update: (id, data) => API.put(`/tables/${id}`, data),
  delete: (id) => API.delete(`/tables/${id}`),
  getQR: (id) => API.get(`/tables/${id}/qr`)
};

// Floors
export const floorAPI = {
  getAll: () => API.get('/floors'),
  create: (data) => API.post('/floors', data),
  update: (id, data) => API.put(`/floors/${id}`, data),
  delete: (id) => API.delete(`/floors/${id}`)
};

// Sessions
export const sessionAPI = {
  getCurrent: () => API.get('/sessions/current'),
  getAll: () => API.get('/sessions'),
  open: (data) => API.post('/sessions/open', data),
  close: (data) => API.put('/sessions/close', data)
};

// Reports
export const reportAPI = {
  getDashboard: (params) => API.get('/reports/dashboard', { params }),
  getSales: (params) => API.get('/reports/sales', { params })
};

// Upload (ImageKit)
export const uploadAPI = {
  getAuth: () => API.get('/upload/auth')
};

// Self-Order (public — no auth needed)
const SELF_ORDER_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
export const selfOrderAPI = {
  // Resolve QR token → table + menu
  getMenu: (token) => axios.get(`${SELF_ORDER_BASE}/self-order/${token}`),
  // Place order
  placeOrder: (token, data) => axios.post(`${SELF_ORDER_BASE}/self-order/${token}/order`, data),
  // Poll status
  getOrderStatus: (orderId) => axios.get(`${SELF_ORDER_BASE}/self-order/order/${orderId}/status`),
  // Pay
  payOrder: (orderId, data) => axios.post(`${SELF_ORDER_BASE}/self-order/order/${orderId}/pay`, data)
};

export const paymentAPI = {
  getRazorpayKey: () => API.get('/payments/razorpay/key'),
  createRazorpayOrder: (data) => API.post('/payments/razorpay/order', data),
  verifyRazorpayPayment: (data) => API.post('/payments/razorpay/verify', data)
};

export default API;