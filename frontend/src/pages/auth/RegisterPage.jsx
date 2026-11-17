import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UtensilsCrossed, ArrowRight, Building2 } from 'lucide-react';

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

  const inputClass =
    'w-full px-3 py-2 bg-cream-50/70 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-200/60 transition-colors';

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4 bg-cream-50 py-8">
      <div className="max-w-lg w-full bg-white rounded-2xl p-7 sm:p-8 border border-stone-200/80 shadow-card">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-stone-900 mx-auto flex items-center justify-center text-cream-50 mb-3">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
            Create student account
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Includes ₹500 starter balance in your campus wallet.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Aarav Sharma"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1.5">Student ID</label>
              <input
                type="text"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                placeholder="STU-2024-001"
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1.5">Institutional Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="aarav@campus.edu"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-stone-600 block mb-1.5">Mobile Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength="6"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className={inputClass}
            />
          </div>

          {/* Hostel Mapping */}
          <div className="p-4 bg-cream-50 rounded-xl border border-stone-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700">
              <Building2 className="w-3.5 h-3.5 text-stone-400" />
              <span>Hostel & Room Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Hostel</label>
                <select
                  value={formData.hostelName}
                  onChange={(e) => setFormData({ ...formData, hostelName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-stone-400"
                >
                  <option value="Aryabhata Bhavan">Aryabhata Bhavan</option>
                  <option value="Ramanujan Bhavan">Ramanujan Bhavan</option>
                  <option value="Gargi Bhavan">Gargi Bhavan</option>
                  <option value="Kalpana Chawla Bhavan">Kalpana Chawla</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Block</label>
                <select
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:border-stone-400"
                >
                  <option value="Block-A">Block-A</option>
                  <option value="Block-B">Block-B</option>
                  <option value="Block-C">Block-C</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Room</label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="204"
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 font-mono focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-600 block mb-1.5">Dietary Preference</label>
            <div className="grid grid-cols-4 gap-2">
              {['veg', 'all', 'jain', 'vegan'].map((pref) => (
                <button
                  key={pref}
                  type="button"
                  onClick={() => setFormData({ ...formData, dietaryPreference: pref })}
                  className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-colors ${
                    formData.dietaryPreference === pref
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-cream-50 text-stone-600 border-stone-200 hover:bg-stone-100'
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
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-stone-500">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-stone-900 underline underline-offset-4 decoration-stone-300 hover:decoration-stone-600">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
