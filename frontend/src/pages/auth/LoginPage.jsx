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
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4 bg-cream-50">
      <div className="max-w-[400px] w-full bg-white rounded-2xl p-7 sm:p-8 border border-stone-200/80 shadow-card">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-stone-900 mx-auto flex items-center justify-center text-cream-50 mb-3.5">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
            Sign in to Bite<span className="text-brand-500">Sync</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Skip the queue. Sync your hostel meal.
          </p>
        </div>

        {/* Quiet 1-Click Demo Access */}
        <div className="mb-6">
          <p className="text-[11px] font-medium text-stone-400 text-center mb-2">
            Quick demo access
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { role: 'student', label: 'Student', sub: 'Aarav', icon: User },
              { role: 'kitchen', label: 'Kitchen', sub: 'Chef', icon: ChefHat },
              { role: 'admin', label: 'Admin', sub: 'Manager', icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickDemoLogin(item.role)}
                  className="px-2 py-2.5 bg-cream-50 hover:bg-stone-100/80 border border-stone-200/80 hover:border-stone-300 rounded-xl text-center transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 mx-auto text-stone-600 mb-1" />
                  <span className="text-xs font-medium text-stone-800 block">{item.label}</span>
                  <span className="text-[10px] text-stone-400 block">{item.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-100"></div>
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-white px-2.5 text-stone-400">or continue with email</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1.5">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@bitesync.com"
                className="w-full pl-9 pr-3.5 py-2 bg-cream-50/70 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 bg-cream-50/70 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200/60 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          New student?{' '}
          <Link to="/register" className="font-medium text-stone-900 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-600">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
