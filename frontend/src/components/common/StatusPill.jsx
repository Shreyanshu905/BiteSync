import React from 'react';

const StatusPill = ({ status }) => {
  const config = {
    placed: {
      label: 'Placed',
      className: 'bg-stone-100 text-stone-700 border-stone-200/80',
      dotClass: 'bg-stone-500',
    },
    accepted: {
      label: 'Accepted',
      className: 'bg-amber-50/70 text-amber-800 border-amber-200/70',
      dotClass: 'bg-amber-500',
    },
    preparing: {
      label: 'Preparing',
      className: 'bg-brand-50 text-brand-700 border-brand-200/80',
      dotClass: 'bg-brand-500',
    },
    ready: {
      label: 'Ready for pickup',
      className: 'bg-emerald-50/80 text-emerald-800 border-emerald-200/80',
      dotClass: 'bg-emerald-600',
    },
    collected: {
      label: 'Collected',
      className: 'bg-stone-50 text-stone-500 border-stone-200/70',
      dotClass: 'bg-stone-400',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-50/60 text-red-700 border-red-200/70',
      dotClass: 'bg-red-500',
    },
  };

  const current = config[status] || {
    label: status,
    className: 'bg-stone-50 text-stone-600 border-stone-200/70',
    dotClass: 'bg-stone-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${current.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dotClass}`}></span>
      <span>{current.label}</span>
    </span>
  );
};

export default StatusPill;
