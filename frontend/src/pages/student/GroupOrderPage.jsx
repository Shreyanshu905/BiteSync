import React, { useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Users, Plus, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const GroupOrderPage = () => {
  const { user } = useAuth();
  const [groupTitle, setGroupTitle] = useState(`${user?.name?.split(' ')[0]}'s Hostel Feast`);
  const [groupCodeInput, setGroupCodeInput] = useState('');
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/group-orders', { title: groupTitle });
      if (res.data.success) {
        setActiveGroup(res.data.data);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!groupCodeInput.trim()) return;
    setLoading(true);
    try {
      const code = groupCodeInput.trim().toUpperCase();
      const res = await api.post(`/group-orders/${code}/join`);
      if (res.data.success) {
        setActiveGroup(res.data.data);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (activeGroup) {
      navigator.clipboard.writeText(activeGroup.groupCode);
      toast.success(`Group code ${activeGroup.groupCode} copied to clipboard!`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Hostel Group Meal Ordering 👥
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Combine food orders with your roommates or study group into a single pickup pass.
        </p>
      </div>

      {!activeGroup ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Group Order */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-stone-900">Start a New Group Order</h2>
              <p className="text-xs text-stone-500 mt-1">
                You will be the group creator and can share your invite code with friends.
              </p>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Order Group Title
                </label>
                <input
                  type="text"
                  required
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                {loading ? 'Creating...' : 'Create Group Session'}
              </button>
            </form>
          </div>

          {/* Join Existing Group */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-stone-900">Join a Friend's Group</h2>
              <p className="text-xs text-stone-500 mt-1">
                Enter the 6-character group code shared by your hostel roommate.
              </p>
            </div>

            <form onSubmit={handleJoinGroup} className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Group Invite Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GRP-4821"
                  value={groupCodeInput}
                  onChange={(e) => setGroupCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                {loading ? 'Joining...' : 'Join Group Meal'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Active Group Session View */
        <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Active Group Session
              </span>
              <h2 className="text-xl font-black text-stone-900 mt-1">{activeGroup.title}</h2>
              <p className="text-xs text-stone-500">
                Share code with hostel friends so they can add their favourite items!
              </p>
            </div>

            {/* Code pill */}
            <div className="flex items-center gap-2">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Invite Code</p>
                <p className="text-xl font-mono font-black text-stone-900">{activeGroup.groupCode}</p>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl"
                title="Copy Code"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Combined Items & Members */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Combined Group Items ({activeGroup.items?.length || 0})
            </h3>

            {(!activeGroup.items || activeGroup.items.length === 0) ? (
              <div className="py-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-100">
                No items added yet. Head to the menu to add dishes!
              </div>
            ) : (
              <div className="divide-y divide-stone-100 border border-stone-100 rounded-2xl p-4 bg-stone-50/50">
                {activeGroup.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-stone-900">{item.name}</span>
                      <span className="text-stone-400 ml-1">× {item.quantity}</span>
                      <span className="text-[11px] text-stone-500 block">Added by: {item.studentName}</span>
                    </div>
                    <span className="font-mono font-bold text-stone-900">₹{item.subtotal}</span>
                  </div>
                ))}

                <div className="pt-3 border-t border-stone-200 flex justify-between font-black text-sm text-stone-900">
                  <span>Combined Total</span>
                  <span className="font-mono text-brand-600">₹{activeGroup.totalAmount || 0}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <Link
              to="/student/menu"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Add Dishes from Menu
            </Link>

            <button
              onClick={() => setActiveGroup(null)}
              className="text-xs text-stone-500 hover:text-stone-700 font-semibold"
            >
              Leave Group Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupOrderPage;

