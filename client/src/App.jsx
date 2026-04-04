import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POSPage';
import KitchenPage from './pages/KitchenPage';
import CustomerDisplayPage from './pages/CustomerDisplayPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import TablesPage from './pages/admin/TablesPage';
import FloorsPage from './pages/admin/FloorsPage';
import SessionsPage from './pages/admin/SessionsPage';
import ReportsPage from './pages/admin/ReportsPage';
import UsersPage from './pages/admin/UsersPage';
import SelfOrderPage from './pages/SelfOrderPage';

// Route guard
const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/pos" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1f2937', color: '#fff', fontSize: '14px' }
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/customer-display/:tableId?" element={<CustomerDisplayPage />} />
        {/* Public self-order route — no auth required */}
        <Route path="/s/:token" element={<SelfOrderPage />} />

        <Route path="/pos" element={
          <PrivateRoute><POSPage /></PrivateRoute>
        } />

        <Route path="/admin" element={
          <PrivateRoute adminOnly><AdminLayout /></PrivateRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="tables" element={<TablesPage />} />
          <Route path="floors" element={<FloorsPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}