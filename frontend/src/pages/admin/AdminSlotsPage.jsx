import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import toast from 'react-hot-toast';
import { Clock, Plus, Lock, Unlock, Edit3, X } from 'lucide-react';

const AdminSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mealPeriodFilter, setMealPeriodFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    startTime: '13:00',
    endTime: '13:15',
    mealPeriod: 'lunch',
    maxCapacity: 25,
  });

  useEffect(() => {
    fetchSlots();
  }, [mealPeriodFilter]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const params = {};
      if (mealPeriodFilter !== 'all') params.mealPeriod = mealPeriodFilter;

      const res = await api.get('/slots', { params });
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleClose = async (slotId) => {
    try {
      const res = await api.patch(`/slots/${slotId}/toggle-close`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchSlots();
      }
    } catch (err) {
      toast.error('Failed to toggle slot');
    }
  };

  const handleUpdateCapacity = async (slotId, currentCap) => {
    const newCap = window.prompt('Enter new maximum order capacity for this slot:', currentCap);
    if (!newCap || isNaN(newCap) || Number(newCap) <= 0) return;

    try {
      const res = await api.put(`/slots/${slotId}`, { maxCapacity: Number(newCap) });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchSlots();
      }
    } catch (err) {
      toast.error('Failed to update capacity');
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/slots', newSlot);
      if (res.data.success) {
        toast.success(res.data.message);
        setIsAddModalOpen(false);
        fetchSlots();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create slot');
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Pickup Slot Capacity Management ⏰
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Configure maximum order limits per 15-minute slot to prevent canteen counter crowding.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Slot Window</span>
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <select
            value={mealPeriodFilter}
            onChange={(e) => setMealPeriodFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-bold shadow-2xs"
          >
            <option value="all">All Meal Sessions</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snacks">Snacks</option>
            <option value="dinner">Dinner</option>
            <option value="late-night">Late-Night</option>
          </select>
        </div>

        {/* Slots Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-stone-400">Loading pickup slots...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {slots.map((slot) => {
              const remaining = Math.max(0, slot.maxCapacity - slot.currentBookings);
              const percentBooked = Math.round((slot.currentBookings / slot.maxCapacity) * 100);

              return (
                <div
                  key={slot._id}
                  className={`bg-white rounded-3xl border p-5 shadow-soft space-y-3 flex flex-col justify-between ${
                    slot.isClosed ? 'border-stone-300 opacity-60 bg-stone-50' : 'border-stone-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {slot.mealPeriod}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          slot.isClosed
                            ? 'text-red-600'
                            : remaining === 0
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {slot.isClosed ? 'Closed' : `${remaining} slots left`}
                      </span>
                    </div>

                    <div className="mt-3 text-xl font-black text-stone-900 font-mono">
                      {slot.startTime} – {slot.endTime}
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] font-medium text-stone-500">
                        <span>Booked: {slot.currentBookings} / {slot.maxCapacity}</span>
                        <span>{percentBooked}%</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentBooked >= 100
                              ? 'bg-red-500'
                              : percentBooked >= 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, percentBooked)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleUpdateCapacity(slot._id, slot.maxCapacity)}
                      className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Capacity
                    </button>

                    <button
                      onClick={() => handleToggleClose(slot._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        slot.isClosed
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {slot.isClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{slot.isClosed ? 'Reopen' : 'Close'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Slot Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-100">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="font-bold text-base text-stone-900">Create Pickup Slot</h3>
                <button onClick={() => setIsAddModalOpen(false)}>
                  <X className="w-5 h-5 text-stone-400" />
                </button>
              </div>

              <form onSubmit={handleCreateSlot} className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Meal Period
                  </label>
                  <select
                    value={newSlot.mealPeriod}
                    onChange={(e) => setNewSlot({ ...newSlot, mealPeriod: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="dinner">Dinner</option>
                    <option value="late-night">Late-Night</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                    Maximum Order Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSlot.maxCapacity}
                    onChange={(e) => setNewSlot({ ...newSlot, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Save Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminSlotsPage;

