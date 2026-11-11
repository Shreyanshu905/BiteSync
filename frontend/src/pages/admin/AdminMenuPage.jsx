import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import MenuItemModal from '../../components/admin/MenuItemModal';
import toast from 'react-hot-toast';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
} from 'lucide-react';

const AdminMenuPage = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  useEffect(() => {
    fetchDishes();
  }, [categoryFilter]);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const res = await api.get('/menu', { params });
      if (res.data.success) {
        setDishes(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (dishId) => {
    try {
      const res = await api.patch(`/menu/${dishId}/toggle-availability`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchDishes();
      }
    } catch (err) {
      toast.error('Failed to toggle availability');
    }
  };

  const handleDeleteDish = async (dishId, dishName) => {
    if (!window.confirm(`Are you sure you want to delete "${dishName}" from canteen menu?`)) return;

    try {
      const res = await api.delete(`/menu/${dishId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchDishes();
      }
    } catch (err) {
      toast.error('Failed to delete dish');
    }
  };

  const filteredDishes = dishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Menu Catalog Management 🍛
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Add dishes, update pricing, schedule meal windows and configure stock levels.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedDish(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
            >
              <option value="all">All Categories</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snacks">Snacks</option>
              <option value="dinner">Dinner</option>
              <option value="late-night">Late-Night</option>
            </select>
          </div>
        </div>

        {/* Dishes Table */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-stone-400">Loading catalog...</div>
          ) : filteredDishes.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400">No dishes found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Dish</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Prep Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredDishes.map((dish) => (
                    <tr key={dish._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={dish.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=80'}
                          alt={dish.name}
                          className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{dish.name}</p>
                          <span className="text-[10px] text-stone-400">
                            {dish.isVeg ? '🌱 Pure Veg' : '🍗 Non-Veg'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 capitalize font-semibold text-stone-700">
                        {dish.category}
                      </td>

                      <td className="py-3 px-4 font-black font-mono text-stone-900 text-sm">
                        ₹{dish.price}
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            dish.stockQuantity <= (dish.lowStockThreshold || 10)
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {dish.stockQuantity}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-stone-500 font-medium">
                        {dish.preparationTimeMinutes || 15} mins
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAvailability(dish._id)}
                          className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-all ${
                            dish.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {dish.isAvailable ? 'Available' : 'Sold Out'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedDish(dish);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDish(dish._id, dish.name)}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <MenuItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={selectedDish}
          onSaved={fetchDishes}
        />
      </main>
    </div>
  );
};

export default AdminMenuPage;

