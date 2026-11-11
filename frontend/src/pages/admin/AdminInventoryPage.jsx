import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import RestockModal from '../../components/admin/RestockModal';
import toast from 'react-hot-toast';
import { Package, Plus, AlertTriangle, CheckCircle2, Search, ArrowUpRight } from 'lucide-react';

const AdminInventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [lowStockOnly]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory', {
        params: { lowStockOnly },
      });
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.supplier?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Raw Ingredients & Kitchen Inventory 📦
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Track stock levels, monitor recipe deductions and restock before thresholds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                lowStockOnly
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{lowStockOnly ? 'Showing Low Stock Only' : 'Filter Low Stock'}</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-soft flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search ingredient, supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-stone-400">Loading inventory items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400">No inventory items found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Ingredient Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Min Threshold</th>
                    <th className="py-3 px-4">Unit Cost</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredItems.map((item) => {
                    const isLow = item.currentStock <= item.minThreshold;

                    return (
                      <tr key={item._id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-stone-900 text-sm">
                          {item.name}
                        </td>

                        <td className="py-3 px-4 capitalize font-semibold text-stone-600">
                          {item.category}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <span
                            className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                              isLow
                                ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                                : 'bg-stone-100 text-stone-900'
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-stone-500 font-mono font-medium">
                          {item.minThreshold} {item.unit}
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-stone-700">
                          ₹{item.costPerUnit || 0} / {item.unit}
                        </td>

                        <td className="py-3 px-4 text-stone-500">
                          {item.supplier}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedRestockItem(item)}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                          >
                            Restock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Restock Modal */}
        <RestockModal
          isOpen={!!selectedRestockItem}
          onClose={() => setSelectedRestockItem(null)}
          item={selectedRestockItem}
          onRestocked={fetchInventory}
        />
      </main>
    </div>
  );
};

export default AdminInventoryPage;

