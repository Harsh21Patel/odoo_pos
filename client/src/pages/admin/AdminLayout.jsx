import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { path: '/admin/products', label: 'Products', icon: '🍕' },
  { path: '/admin/categories', label: 'Categories', icon: '📂' },
  { path: '/admin/floors', label: 'Floors', icon: '🏢' },
  { path: '/admin/tables', label: 'Tables', icon: '🪑' },
  { path: '/admin/sessions', label: 'Sessions', icon: '🔑' },
  { path: '/admin/reports', label: 'Reports', icon: '📈' },
  { path: '/admin/users', label: 'Users', icon: '👥' }
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className={`${collapsed ? 'w-16' : 'w-56'} bg-white border-r border-gray-200 flex flex-col transition-all duration-200 shadow-sm`}>
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-200 flex items-center gap-2">
          <span className="text-2xl flex-shrink-0">☕</span>
          {!collapsed && <span className="font-bold text-gray-800 text-sm">POS Admin</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-gray-400 hover:text-gray-600 text-xs">
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path} to={item.path} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'}`
              }
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-200 space-y-2">
          <button
            onClick={() => navigate('/pos')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-purple-600 hover:bg-purple-50 transition-colors font-medium"
          >
            <span>🖥️</span>
            {!collapsed && <span>Go to POS</span>}
          </button>
          {!collapsed && (
            <div className="px-3 py-2 bg-gray-50 rounded-xl">
              <p className="text-xs font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <h1 className="font-semibold text-gray-800">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
            <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}