import React from 'react';
import { Clock, User, CheckCircle, ChefHat, PackageCheck, AlertCircle } from 'lucide-react';
import StatusPill from '../common/StatusPill';

const OrderCard = ({ order, onUpdateStatus, onOpenQRScanner }) => {
  const isDelayed =
    ['placed', 'accepted', 'preparing'].includes(order.status) &&
    Date.now() - new Date(order.createdAt).getTime() > 25 * 60 * 1000;

  return (
    <div
      className={`bg-white rounded-xl border p-4 shadow-soft transition-colors flex flex-col justify-between ${
        isDelayed ? 'border-red-300/90' : 'border-stone-200/80'
      }`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-stone-900">
                #{order.orderNumber}
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-medium text-[11px] bg-stone-100 text-stone-700">
                {order.pickupToken}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {order.slotDisplay?.startTime} – {order.slotDisplay?.endTime} ({order.slotDisplay?.mealPeriod})
            </p>
          </div>

          <StatusPill status={order.status} />
        </div>

        {/* Student details */}
        <div className="py-2 px-2.5 flex items-center justify-between text-xs text-stone-600 bg-cream-50 rounded-lg border border-stone-100 my-2.5">
          <div className="flex items-center gap-1.5 font-medium text-stone-800">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span>{order.student?.name || 'Student'}</span>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">
            {order.hostelDetails?.hostelName || 'Hostel'} · {order.hostelDetails?.roomNumber || '101'}
          </span>
        </div>

        {/* Items List */}
        <div className="space-y-1.5 my-2.5">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-0.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px] flex items-center justify-center shrink-0 tabular-nums">
                  {item.quantity}
                </span>
                <span className="font-medium text-stone-800">{item.name}</span>
              </div>
              <span className="text-stone-500 tabular-nums">₹{item.subtotal}</span>
            </div>
          ))}
        </div>

        {isDelayed && (
          <div className="p-2 bg-red-50/70 text-red-700 rounded-lg text-[11px] flex items-center gap-1.5 mt-2 border border-red-200/60">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Waiting over 25 mins — prioritize preparation.
          </div>
        )}
      </div>

      {/* Action Workflow Buttons */}
      <div className="pt-3 border-t border-stone-100 mt-2 flex items-center gap-2">
        {order.status === 'placed' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'accepted')}
            className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Accept Order
          </button>
        )}

        {order.status === 'accepted' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'preparing')}
            className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <ChefHat className="w-3.5 h-3.5" />
            Start Preparing
          </button>
        )}

        {order.status === 'preparing' && (
          <button
            onClick={() => onUpdateStatus(order._id, 'ready')}
            className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            Mark Ready
          </button>
        )}

        {order.status === 'ready' && (
          <button
            onClick={() => onOpenQRScanner(order.pickupToken)}
            className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            Verify & Handover
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
