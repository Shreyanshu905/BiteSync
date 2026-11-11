import React from 'react';

const StatusPill = ({ status }) => {
  const config = {
    placed: {
      label: 'Order Placed',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
      dotClass: 'bg-blue-500',
    },
    accepted: {
      label: 'Accepted by Kitchen',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500',
    },
    preparing: {
      label: 'Cooking Now 🔥',
      className: 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse',
      dotClass: 'bg-orange-500',
    },
    ready: {
      label: 'Ready for Pickup! 🍱',
      className: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-xs',
      dotClass: 'bg-emerald-500 animate-ping',
    },
    collected: {
      label: 'Collected ✨',
      className: 'bg-stone-100 text-stone-700 border-stone-200',
      dotClass: 'bg-stone-500',
    },
    cancelled: {
      label: 'Cancelled ✖',
      className: 'bg-red-50 text-red-700 border-red-200',
      dotClass: 'bg-red-500',
    },
  };

  const current = config[status] || {
    label: status,
    className: 'bg-stone-50 text-stone-700 border-stone-200',
    dotClass: 'bg-stone-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dotClass}`}></span>
      <span>{current.label}</span>
    </span>
  );
};

export default StatusPill;

