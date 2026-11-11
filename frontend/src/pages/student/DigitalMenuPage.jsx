import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import FoodCard from '../../components/student/FoodCard';
import { Search, SlidersHorizontal, Sparkles, Filter, X } from 'lucide-react';

const DigitalMenuPage = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [isVeg, setIsVeg] = useState('all');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(150);

  const categories = [
    { id: 'all', label: 'All Items', icon: '🍽️' },
    { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { id: 'lunch', label: 'Lunch', icon: '☀️' },
    { id: 'snacks', label: 'Snacks & Tea', icon: '☕' },
    { id: 'dinner', label: 'Dinner', icon: '🌙' },
    { id: 'late-night', label: 'Late-Night', icon: '✨' },
  ];

  useEffect(() => {
    fetchDishes();
  }, [category, isVeg]);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'all') params.category = category;
      if (isVeg !== 'all') params.isVeg = isVeg === 'veg';

      const res = await api.get('/menu', { params });
      if (res.data.success) {
        setDishes(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter in-memory for search and price slider
  const filteredDishes = dishes.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase());
    const matchesPrice = d.price <= maxPrice;
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Canteen Food Menu 🍱
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Select freshly prepared hostel dishes, customize your quantities and pick up at your chosen slot.
        </p>
      </div>

      {/* Sticky Category Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shadow-2xs ${
              category === cat.id
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-[1.02]'
                : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by dish name, e.g. Masala Dosa, Thali, Maggi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Veg / Non-Veg Toggle Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setIsVeg('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isVeg === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              All Dishes
            </button>
            <button
              onClick={() => setIsVeg('veg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isVeg === 'veg' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              Pure Veg
            </button>
          </div>

          {/* Price Range Slider */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-stone-600 border-l border-stone-200 pl-3">
            <span>Under:</span>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-brand-500 w-24 cursor-pointer"
            />
            <span className="font-bold text-stone-900 font-mono">₹{maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Food Items Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading canteen dishes...</span>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
          <p className="text-base font-bold text-stone-800">No dishes found matching your filters</p>
          <p className="text-xs text-stone-400 mt-1">Try clearing search or switching categories.</p>
          <button
            onClick={() => {
              setCategory('all');
              setIsVeg('all');
              setSearch('');
              setMaxPrice(200);
            }}
            className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredDishes.map((dish) => (
            <FoodCard key={dish._id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DigitalMenuPage;
