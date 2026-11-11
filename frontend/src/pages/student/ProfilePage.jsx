import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Building2, ShieldCheck, Save } from 'lucide-react';

const ProfilePage = () => {
  const { user, fetchCurrentUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [hostelName, setHostelName] = useState(user?.hostel?.hostelName || 'Aryabhata Bhavan');
  const [block, setBlock] = useState(user?.hostel?.block || 'Block-A');
  const [roomNumber, setRoomNumber] = useState(user?.hostel?.roomNumber || '101');
  const [dietaryPreference, setDietaryPreference] = useState(user?.dietaryPreference || 'all');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        name,
        phone,
        dietaryPreference,
        hostel: {
          hostelName,
          block,
          roomNumber,
        },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchCurrentUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Student Profile & Hostel Mapping 👤
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Manage your verified campus details and dining preferences.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-card space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-stone-100">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-brand-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-900">{user?.name}</h2>
            <p className="text-xs text-stone-500 font-mono">
              Student ID: <span className="font-bold text-stone-800">{user?.studentId}</span>
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Institutional Account
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Institutional Email (Read Only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Dietary Preference
              </label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase font-bold"
              >
                <option value="all">All Dishes</option>
                <option value="veg">Pure Vegetarian</option>
                <option value="jain">Jain Friendly</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
          </div>

          {/* Hostel Mapping */}
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-3 pt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-700" />
              Campus Hostel Details
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Bhavan</label>
                <input
                  type="text"
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Block / Wing</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Room Number</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Changes...' : 'Save Profile Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

