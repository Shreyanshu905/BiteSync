import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { ChefHat, X, CheckSquare } from 'lucide-react';

const PrepSheetModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
    }
  }, [isOpen]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/kitchen/summary');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900">
                Kitchen Preparation Sheet
              </h3>
              <p className="text-xs text-stone-500">
                Aggregated portion requirements for upcoming pickup windows
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">
            Calculating kitchen portions...
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {/* Overall totals */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                Total Dishes to Cook ({data?.totalActiveOrders || 0} active orders)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data?.overallItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-stone-900">{item.dishName}</p>
                      <span className="text-[10px] text-stone-500">{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
                    </div>
                    <span className="text-lg font-black text-brand-600 font-mono">
                      {item.totalQuantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown per Pickup Slot */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                Slot-Wise Preparation Schedule
              </h4>
              <div className="space-y-3">
                {data?.bySlot?.map((slot, idx) => (
                  <div key={idx} className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <div className="flex items-center justify-between border-b border-amber-200/50 pb-2 mb-2">
                      <span className="font-bold text-sm text-stone-900">
                        ⏰ Slot {slot.slotTime} ({slot.mealPeriod})
                      </span>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        {slot.totalOrders} Orders
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {Object.entries(slot.items).map(([dishName, qty], i) => (
                        <div key={i} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-amber-100">
                          <span className="text-stone-700 truncate">{dishName}</span>
                          <span className="font-bold text-stone-900 font-mono">x{qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrepSheetModal;
