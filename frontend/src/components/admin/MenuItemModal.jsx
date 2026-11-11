import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { X, Plus, Trash2 } from 'lucide-react';

const MenuItemModal = ({ isOpen, onClose, item, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'breakfast',
    isVeg: true,
    isAvailable: true,
    stockQuantity: 50,
    lowStockThreshold: 10,
    preparationTimeMinutes: 15,
    imageUrl: '',
    isFeatured: false,
    availableMealWindows: ['breakfast'],
    recipeIngredients: [],
  });

  const [ingredientsList, setIngredientsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadIngredients();
      if (item) {
        setFormData({
          name: item.name || '',
          description: item.description || '',
          price: item.price || '',
          category: item.category || 'breakfast',
          isVeg: item.isVeg !== undefined ? item.isVeg : true,
          isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
          stockQuantity: item.stockQuantity || 50,
          lowStockThreshold: item.lowStockThreshold || 10,
          preparationTimeMinutes: item.preparationTimeMinutes || 15,
          imageUrl: item.imageUrl || '',
          isFeatured: item.isFeatured || false,
          availableMealWindows: item.availableMealWindows || [item.category || 'breakfast'],
          recipeIngredients: item.recipeIngredients || [],
        });
      } else {
        setFormData({
          name: '',
          description: '',
          price: '',
          category: 'breakfast',
          isVeg: true,
          isAvailable: true,
          stockQuantity: 50,
          lowStockThreshold: 10,
          preparationTimeMinutes: 15,
          imageUrl: '',
          isFeatured: false,
          availableMealWindows: ['breakfast'],
          recipeIngredients: [],
        });
      }
    }
  }, [isOpen, item]);

  const loadIngredients = async () => {
    try {
      const res = await api.get('/inventory');
      if (res.data.success) {
        setIngredientsList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        const res = await api.put(`/menu/${item._id}`, formData);
        toast.success(res.data.message || 'Menu item updated!');
      } else {
        const res = await api.post('/menu', formData);
        toast.success(res.data.message || 'Dish added to menu!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save dish');
    } finally {
      setLoading(false);
    }
  };

  const addRecipeRow = () => {
    if (ingredientsList.length === 0) return;
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: [
        ...prev.recipeIngredients,
        { ingredient: ingredientsList[0]._id, quantity: 0.1, unit: ingredientsList[0].unit },
      ],
    }));
  };

  const removeRecipeRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: prev.recipeIngredients.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h3 className="font-bold text-lg text-stone-900">
            {item ? 'Edit Menu Item' : 'Add New Dish to Menu'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Dish Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="e.g. Paneer Butter Masala"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="e.g. 120"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              placeholder="Freshly prepared paneer cubes in rich tomato gravy..."
            ></textarea>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="snacks">Snacks</option>
                <option value="dinner">Dinner</option>
                <option value="late-night">Late-Night</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Prep Time (mins)
              </label>
              <input
                type="number"
                min="1"
                value={formData.preparationTimeMinutes}
                onChange={(e) => setFormData({ ...formData, preparationTimeMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={formData.isVeg}
                onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded"
              />
              Vegetarian Dish
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded"
              />
              Available for Order
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded"
              />
              Chef's Special / Featured
            </label>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {loading ? 'Saving...' : item ? 'Update Dish' : 'Add Dish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemModal;
