import React from 'react';
import { Clock, User, CheckCircle, ChefHat, PackageCheck, AlertCircle } from 'lucide-react';
import StatusPill from '../common/StatusPill';

const OrderCard = ({ order, onUpdateStatus, onOpenQRScanner }) => {
  const isDelayed =
    ['placed', 'accepted', 'preparing'].includes(order.status) &&
    Date.now() - new Date(order.createdAt).getTime() > 25 * 60 * 1000;

  return (
    <div
      className={`bg-white rounded-2xl border p-4 shadow-soft transition-all duration-150 flex flex-col justify-between ${
        isDelayed ? 'border-red-300 ring-2 ring-red-100' : 'border-stone-100'
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-stone-900">
                #{order.orderNumber}
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-100 text-amber-900 border border-amber-200">
                {order.pickupToken}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              Slot: {order.slotDisplay?.startTime} – {order.slotDisplay?.endTime} ({order.slotDisplay?.mealPeriod})
            </p>
          </div>

          <StatusPill status={order.status} />
        </div>

        {/* Student details */}
        <div className="py-2.5 flex items-center justify-between text-xs text-stone-600 bg-stone-50/70 px-2.5 rounded-xl my-2.5">
          <div className="flex items-center gap-1.5 font-medium text-stone-900">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span>{order.student?.name || 'Student'}</span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">
            {order.hostelDetails?.hostelName || 'Hostel'} • Room {order.hostelDetails?.roomNumber || '101'}
          </span>
        </div>

        {/* Items List */}
        <div className="space-y-1.5 my-2">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-stone-50"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {item.quantity}
                </span>
                <span className="font-semibold text-stone-800">{item.name}</span>
              </div>
              <span className="text-stone-500 font-medium">₹{item.subtotal}</span>
            </div>
          ))}
        </div>

        {isDelayed && (
          <div className="p-2 bg-red-50 text-red-700 rounded-lg text-[11px] flex items-center gap-1.5 mt-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
            Order waiting over 25 mins. Priority prep requested!
          </div>
        )}
      </div>

      {/* Action Workflow Buttons */}
      <div className="pt-3 border-t border-stone-100 mt-2 flex items-center gap-2">
        {order.status === 'placed' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'accepted')}
            className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Accept Order
          </button>
        )}

        {order.status === 'accepted' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'preparing')}
            className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
          >
            <ChefHat className="w-3.5 h-3.5" />
            Start Cooking
          </button>
        )}

        {order.status === 'preparing' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'ready')}
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            Mark Ready for Pickup
          </button>
        )}

        {order.status === 'ready' && (
          <button
            onClick={() => onOpenQRScanner(order.pickupToken)}
            className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs"
          >
            Verify & Handover Food
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;

