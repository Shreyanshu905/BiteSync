import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';

const MessCalendarPage = () => {
  const [activeDay, setActiveDay] = useState('Wednesday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const schedule = {
    Monday: {
      breakfast: 'Poha with Sev & Peanuts, Boiled Sprouts, Kadak Masala Chai',
      lunch: 'Rajma Rasila, Steamed Basmati Rice, Aloo Jeera, Tawa Roti, Boondi Raita',
      snacks: 'Vegetable Samosa with Tamarind Chutney, Adrak Chai',
      dinner: 'Dal Makhani, Mix Veg Korma, 3 Butter Phulka, Jeera Rice, Gulab Jamun',
    },
    Tuesday: {
      breakfast: 'Crispy Masala Dosa with Sambhar & Coconut Chutney, Hot Filter Coffee',
      lunch: 'Chole Masala, Butter Bhature, Pulao, Green Salad, Fresh Curd',
      snacks: 'Grilled Veg Cheese Sandwich, Lemon Tea',
      dinner: 'Paneer Butter Masala, Yellow Dal Tadka, Whole Wheat Roti, Rice, Kheer',
    },
    Wednesday: {
      breakfast: 'Aloo Pyaz Paratha with Butter & Pickle, Dahi, Special Elaichi Chai',
      lunch: 'Veg Special Thali: Shahi Paneer, Dal Fry, Seasonal Subzi, Roti, Rice, Rasgulla (Hostel Special)',
      snacks: 'Pav Bhaji with Butter Pav, Masala Chai',
      dinner: 'Kadhai Paneer, Kashmiri Dum Aloo, Garlic Naan / Tawa Roti, Veg Biryani',
      isFeast: true,
    },
    Thursday: {
      breakfast: 'Idli Sambhar & Medu Vada (2 pcs), Red Onion Tomato Chutney, Coffee',
      lunch: 'Kadhi Pakoda, Fragrant Jeera Rice, Bhindi Do Pyaza, Phulka',
      snacks: 'Bread Pakoda with Green Mint Chutney, Hot Chai',
      dinner: 'Matar Paneer, Dal Palak, Steamed Rice, Tawa Roti, Fruit Custard',
    },
    Friday: {
      breakfast: 'Methi Paratha with Fresh Curd, Mixed Spiced Pickle, Kadak Chai',
      lunch: 'Dal Tadka, Dum Aloo Banarasi, Steamed Rice, Roti, Cucumber Raita',
      snacks: 'Crispy Veg Cutlet, Tomato Ketchup, Cold Coffee',
      dinner: 'Malai Kofta, Mix Dal Fry, Butter Roti, Peas Pulao, Moong Dal Halwa',
      isFeast: true,
    },
    Saturday: {
      breakfast: 'Upma with Coconut Chutney, Roasted Peanuts, Hot Chai',
      lunch: 'Pav Bhaji Feast with Lemon Onions, Masala Buttermilk',
      snacks: 'Maggi Noodles with Double Veggie Masala, Filter Coffee',
      dinner: 'Paneer Tikka Masala, Dal Makhani, Laccha Paratha, Jeera Rice, Ice Cream',
    },
    Sunday: {
      breakfast: 'Bedmi Puri with Aloo Sabzi, Suji Halwa, Special Sunday Chai',
      lunch: 'Hyderabadi Veg Dum Biryani with Mirchi Ka Salan, Onion Raita, Papad',
      snacks: 'Paneer Kathi Roll, Cold Bournvita / Chai',
      dinner: 'Light Khichdi / Comfort Dal Rice with Ghee, Aloo Chokha, Papad & Achar',
    },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Hostel Mess Menu Calendar 📅
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          7-Day recurring mess meal timetable for breakfast, lunch, snacks and dinner.
        </p>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((day) => {
          const isToday = day === 'Wednesday'; // Current local weekday demo
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-2xs flex items-center gap-1.5 ${
                activeDay === day
                  ? 'bg-stone-900 text-white scale-[1.02] shadow-md'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200/80'
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day Schedule Showcase */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <span>{activeDay}'s Mess Schedule</span>
              {schedule[activeDay].isFeast && (
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Special Hostel Feast Day
                </span>
              )}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Available for instant advance pre-ordering through BiteSync
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Breakfast */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-amber-800">
                🌅 Breakfast (7:30 – 10:00 AM)
              </span>
            </div>
            <p className="text-sm font-bold text-stone-900 leading-relaxed">
              {schedule[activeDay].breakfast}
            </p>
          </div>

          {/* Lunch */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-800">
                ☀️ Lunch (12:30 – 2:45 PM)
              </span>
            </div>
            <p className="text-sm font-bold text-stone-900 leading-relaxed">
              {schedule[activeDay].lunch}
            </p>
          </div>

          {/* Evening Snacks */}
          <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-orange-800">
                ☕ Evening Snacks (4:30 – 6:30 PM)
              </span>
            </div>
            <p className="text-sm font-bold text-stone-900 leading-relaxed">
              {schedule[activeDay].snacks}
            </p>
          </div>

          {/* Dinner */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs uppercase tracking-wider text-indigo-800">
                🌙 Dinner (7:30 – 10:00 PM)
              </span>
            </div>
            <p className="text-sm font-bold text-stone-900 leading-relaxed">
              {schedule[activeDay].dinner}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessCalendarPage;

