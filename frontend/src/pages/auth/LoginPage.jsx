import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, ArrowRight, Shield, User, ChefHat, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'kitchen') navigate('/kitchen/dashboard');
      else navigate('/student/dashboard');
    }
  };

  const handleQuickDemoLogin = async (demoRole) => {
    setLoading(true);
    const creds = {
      student: { email: 'student@bitesync.com', password: 'Password123' },
      admin: { email: 'admin@bitesync.com', password: 'Password123' },
      kitchen: { email: 'kitchen@bitesync.com', password: 'Password123' },
    };

    const target = creds[demoRole];
    setEmail(target.email);
    setPassword(target.password);

    const res = await login(target.email, target.password);
    setLoading(false);
    if (res.success) {
      if (res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'kitchen') navigate('/kitchen/dashboard');
      else navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-linear-to-b from-cream-100 to-amber-50/40">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200/80 shadow-card">
        {/* Logo and Tagline */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-brand-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-3">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Sign In to Bite<span className="text-brand-500">Sync</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Smart Hostel Canteen Pre-Ordering Platform
          </p>
        </div>

        {/* 1-Click Demo Login Selector for Evaluation */}
        <div className="mb-6 p-3 bg-amber-50 rounded-2xl border border-amber-200/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 text-center mb-2">
            ⚡ Quick Demo Accounts (1-Click Login)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              className="px-2 py-2 bg-white hover:bg-brand-50 hover:border-brand-300 border border-amber-200 rounded-xl text-center transition-all group shadow-2xs"
            >
              <User className="w-4 h-4 mx-auto text-brand-600 mb-0.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-stone-800 block">Student</span>
              <span className="text-[9px] text-stone-400 block">Aarav</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('kitchen')}
              className="px-2 py-2 bg-white hover:bg-amber-100 hover:border-amber-300 border border-amber-200 rounded-xl text-center transition-all group shadow-2xs"
            >
              <ChefHat className="w-4 h-4 mx-auto text-amber-700 mb-0.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-stone-800 block">Kitchen</span>
              <span className="text-[9px] text-stone-400 block">Chef</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="px-2 py-2 bg-white hover:bg-purple-50 hover:border-purple-300 border border-amber-200 rounded-xl text-center transition-all group shadow-2xs"
            >
              <Shield className="w-4 h-4 mx-auto text-purple-600 mb-0.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold text-stone-800 block">Admin</span>
              <span className="text-[9px] text-stone-400 block">Manager</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@bitesync.com"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In to BiteSync</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          New student?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Register your Hostel Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

