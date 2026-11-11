import React from 'react';

const MealPeriodBadge = ({ period }) => {
  const map = {
    breakfast: { label: 'Breakfast', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    lunch: { label: 'Lunch', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    snacks: { label: 'Evening Snacks', bg: 'bg-orange-100 text-orange-800 border-orange-200' },
    dinner: { label: 'Dinner', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    'late-night': { label: 'Late Night', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
  };

  const item = map[period?.toLowerCase()] || { label: period, bg: 'bg-stone-100 text-stone-800 border-stone-200' };

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${item.bg}`}>
      {item.label}
    </span>
  );
};

export default MealPeriodBadge;
