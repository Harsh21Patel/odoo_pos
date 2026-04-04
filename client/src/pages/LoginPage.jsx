import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let user;
      if (isSignup) {
        const data = await register(form.name, form.email, form.password, form.role);
        user = data.user;
        toast.success('Account created!');
      } else {
        const data = await login(form.email, form.password);
        user = data.user;
        toast.success(`Welcome, ${user.name}!`);
      }
      navigate(user.role === 'admin' ? '/admin' : '/pos');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-700"></div>
      </div>

      <div className="relative w-full max-w-4xl flex gap-8 items-start">
        {/* Login Card */}
        <div className="flex-1 bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
              <span className="text-3xl">☕</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Odoo POS Cafe</h1>
            <p className="text-gray-500 text-sm mt-1">
              {isSignup ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!isSignup ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${isSignup ? 'bg-white shadow text-purple-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text" name="name" value={form.name} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="John Doe" required={isSignup}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                placeholder="admin@cafe.com" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                placeholder="••••••••" required
              />
            </div>
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                  <option value="staff">POS Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-purple-200"
            >
              {isLoading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {!isSignup && (
            <div className="mt-6 p-4 bg-purple-50 rounded-xl">
              <p className="text-xs font-semibold text-purple-700 mb-2">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-purple-600">
                <p>Admin: admin@cafe.com / admin123</p>
                <p>Staff: alice@cafe.com / staff123</p>
              </div>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="hidden lg:block flex-1 text-white pt-8">
          <h2 className="text-3xl font-bold mb-4">Complete POS Solution</h2>
          <p className="text-purple-200 mb-8">Manage your cafe operations seamlessly with our modern point-of-sale system.</p>
          {[
            { icon: '🏪', title: 'Floor & Table Management', desc: 'Organize tables across multiple floors' },
            { icon: '🍕', title: 'Product Catalog', desc: 'Manage menu items with variants & pricing' },
            { icon: '🍳', title: 'Kitchen Display System', desc: 'Real-time order tracking for kitchen staff' },
            { icon: '📊', title: 'Reports & Analytics', desc: 'Detailed sales reports and insights' },
            { icon: '📱', title: 'UPI & Digital Payments', desc: 'Accept cash, card, and UPI payments' }
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{f.icon}</div>
              <div>
                <p className="font-semibold">{f.title}</p>
                <p className="text-purple-300 text-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}