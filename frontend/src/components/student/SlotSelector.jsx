import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Clock, AlertCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const SlotSelector = ({ selectedSlotId, onSelectSlot, mealPeriod }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchSlots = async () => {
    try {
      const res = await api.get('/slots', {
        params: { mealPeriod: mealPeriod || 'all' },
      });
      if (res.data.success) {
        setSlots(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [mealPeriod]);

  // Listen for live slot capacity updates via Socket.IO
  useEffect(() => {
    if (!socket) return;
    const handleCapacityChange = (data) => {
      setSlots((prev) =>
        prev.map((s) =>
          s._id === data.slotId
            ? { ...s, currentBookings: data.currentBookings, maxCapacity: data.maxCapacity }
            : s
        )
      );
    };

    socket.on('slot_capacity_changed', handleCapacityChange);
    return () => {
      socket.off('slot_capacity_changed', handleCapacityChange);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="py-6 flex items-center justify-center text-xs text-stone-400 gap-2">
        <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        Loading available pickup slots...
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
        No active slots configured for this meal period right now.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-brand-600" />
          Select Pickup Time Window
        </label>
        <span className="text-[11px] text-stone-400">15-min intervals</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
        {slots.map((slot) => {
          const remaining = Math.max(0, slot.maxCapacity - slot.currentBookings);
          const isFull = remaining <= 0 || slot.isClosed;
          const isSelected = selectedSlotId === slot._id;

          return (
            <button
              key={slot._id}
              type="button"
              disabled={isFull}
              onClick={() => onSelectSlot(slot._id, slot)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                isFull
                  ? 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/30 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-brand-300 hover:bg-stone-50'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-stone-900">
                  {slot.startTime} – {slot.endTime}
                </div>
                <div className="text-[10px] text-stone-400 capitalize mt-0.5">
                  {slot.mealPeriod}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold ${
                    isFull
                      ? 'text-red-500'
                      : remaining <= 5
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {isFull ? (slot.isClosed ? 'Closed' : 'Full') : `${remaining} slots left`}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlotSelector;
