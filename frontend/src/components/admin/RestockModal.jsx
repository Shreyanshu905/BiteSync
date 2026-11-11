import React, { useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { X, PackagePlus } from 'lucide-react';

const RestockModal = ({ isOpen, onClose, item, onRestocked }) => {
  const [quantity, setQuantity] = useState(10);
  const [cost, setCost] = useState('');
  const [note, setNote] = useState('Standard Supply Restock');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(`/inventory/${item._id}/restock`, {
        quantity: Number(quantity),
        cost: cost ? Number(cost) : item.costPerUnit,
        note,
      });

      toast.success(res.data.message || 'Restock recorded!');
      onRestocked();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-100">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-base text-stone-900">
              Restock {item.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-3 p-3 bg-stone-50 rounded-xl text-xs flex justify-between">
          <span className="text-stone-500">Current Stock:</span>
          <span className="font-bold text-stone-900 font-mono">
            {item.currentStock} {item.unit}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Quantity to Add ({item.unit}) *
            </label>
            <input
              type="number"
              required
              min="0.1"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Unit Cost (₹)
            </label>
            <input
              type="number"
              min="0"
              placeholder={item.costPerUnit ? `₹${item.costPerUnit}` : '₹50'}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Supplier / Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
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
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {loading ? 'Recording...' : 'Confirm Restock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;

