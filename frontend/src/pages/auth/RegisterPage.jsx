import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, ArrowRight, Building2, User, Mail, Lock, Phone } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentId: '',
    phone: '',
    hostelName: 'Aryabhata Bhavan',
    block: 'Block-A',
    roomNumber: '',
    dietaryPreference: 'veg',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      studentId: formData.studentId,
      phone: formData.phone,
      dietaryPreference: formData.dietaryPreference,
      hostel: {
        hostelName: formData.hostelName,
        block: formData.block,
        roomNumber: formData.roomNumber,
      },
    };

    const res = await register(payload);
    setLoading(false);
    if (res.success) {
      navigate('/student/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-linear-to-b from-cream-100 to-amber-50/40 py-8">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-stone-200/80 shadow-card">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-brand-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-md shadow-brand-500/25 mb-2">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">
            Student Registration
          </h1>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Join BiteSync & receive ₹500 welcome canteen credit!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Student ID / Roll No *
              </label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                placeholder="e.g. STU-2024-001"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="aarav@campus.edu"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              minLength="6"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          {/* Hostel Mapping Section */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/70 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
              <Building2 className="w-4 h-4 text-amber-700" />
              <span>Campus Hostel & Room Mapping</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Hostel Bhavan</label>
                <select
                  value={formData.hostelName}
                  onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
                  className="w-full px-2.5 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium"
                >
                  <option value="Aryabhata Bhavan">Aryabhata Bhavan</option>
                  <option value="Ramanujan Bhavan">Ramanujan Bhavan</option>
                  <option value="Gargi Bhavan">Gargi Bhavan</option>
                  <option value="Kalpana Chawla Bhavan">Kalpana Chawla</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Block / Wing</label>
                <select
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  className="w-full px-2.5 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium"
                >
                  <option value="Block-A">Block-A</option>
                  <option value="Block-B">Block-B</option>
                  <option value="Block-C">Block-C</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Room Number *</label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g. 204"
                  className="w-full px-2.5 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Dietary Preference
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['veg', 'all', 'jain', 'vegan'].map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => setFormData({ ...formData, dietaryPreference: pref })}
                  className={`py-2 rounded-xl text-xs font-bold uppercase border transition-all ${
                    formData.dietaryPreference === pref
                      ? 'bg-brand-500 text-white border-brand-500 shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Complete Registration & Claim ₹500</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

