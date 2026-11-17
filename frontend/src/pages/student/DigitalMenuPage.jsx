import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import FoodCard from '../../components/student/FoodCard';
import { Search, X } from 'lucide-react';

const DigitalMenuPage = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [isVeg, setIsVeg] = useState('all');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(200);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'snacks', label: 'Snacks & Tea' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'late-night', label: 'Late-Night' },
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

  const filteredDishes = dishes.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase());
    const matchesPrice = d.price <= maxPrice;
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
          Canteen Menu
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Browse today's freshly prepared hostel dishes and add them to your pickup order.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
              category === cat.id
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200/80'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-3 rounded-xl border border-stone-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search dishes (e.g. Masala Dosa, Thali, Maggi)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-cream-50/70 border border-stone-200/80 rounded-lg text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:border-stone-400 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-cream-100/80 p-0.5 rounded-lg border border-stone-200/70">
            <button
              onClick={() => setIsVeg('all')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                isVeg === 'all' ? 'bg-white text-stone-900 shadow-soft' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setIsVeg('veg')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isVeg === 'veg' ? 'bg-white text-emerald-800 shadow-soft' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Veg only
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-stone-500 border-l border-stone-200 pl-3">
            <span>Max:</span>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="accent-stone-800 w-24 cursor-pointer"
            />
            <span className="font-medium text-stone-800 tabular-nums w-9">₹{maxPrice}</span>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-stone-400 flex flex-col items-center gap-2.5">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div>
          <span>Loading menu...</span>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-stone-200/80 p-8">
          <p className="text-sm font-medium text-stone-800">No dishes match your filters</p>
          <p className="text-xs text-stone-400 mt-1">Try clearing your search or switching categories.</p>
          <button
            onClick={() => {
              setCategory('all');
              setIsVeg('all');
              setSearch('');
              setMaxPrice(200);
            }}
            className="mt-4 px-3.5 py-1.5 bg-cream-100 hover:bg-stone-200/70 text-stone-700 font-medium text-xs rounded-lg transition-colors"
          >
            Reset filters
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
