import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusPill from '../../components/common/StatusPill';
import toast from 'react-hot-toast';
import { Search, Filter, RefreshCw, XCircle, Clock, Eye } from 'lucide-react';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [mealPeriodFilter, setMealPeriodFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, mealPeriodFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (mealPeriodFilter !== 'all') params.mealPeriod = mealPeriodFilter;

      const res = await api.get('/orders/all', { params });
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelByAdmin = async (orderId) => {
    const reason = window.prompt('Enter reason for admin cancellation (Full refund will be credited to student):', 'Cancelled by Canteen Admin');
    if (!reason) return;

    try {
      const res = await api.post(`/orders/${orderId}/cancel`, { reason });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const filteredOrders = orders.filter((o) =>
    o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
    o.pickupToken?.toLowerCase().includes(search.toLowerCase()) ||
    o.student?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Canteen Order Management 🛍️
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Search orders, monitor queue progress, track payments and issue refunds.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-3xl border border-stone-200/80 shadow-soft flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by order #, token or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
            >
              <option value="all">All Statuses</option>
              <option value="placed">Placed</option>
              <option value="accepted">Accepted</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready for Pickup</option>
              <option value="collected">Collected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={mealPeriodFilter}
              onChange={(e) => setMealPeriodFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
            >
              <option value="all">All Meal Sessions</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snacks">Snacks</option>
              <option value="dinner">Dinner</option>
              <option value="late-night">Late-Night</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-soft overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-stone-400">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400">No matching orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-100 text-stone-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Slot Time</th>
                    <th className="py-3 px-4">Dishes</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-stone-900 block">
                          #{order.orderNumber}
                        </span>
                        <span className="font-mono font-bold text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                          {order.pickupToken}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-stone-900 block">
                          {order.student?.name || 'Student'}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {order.hostelDetails?.hostelName} • Room {order.hostelDetails?.roomNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-800 block">
                          {order.slotDisplay?.startTime} – {order.slotDisplay?.endTime}
                        </span>
                        <span className="text-[10px] text-stone-400 capitalize">
                          {order.slotDisplay?.mealPeriod}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate text-stone-600">
                        {order.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
                      </td>

                      <td className="py-3 px-4 font-black font-mono text-stone-900 text-sm">
                        ₹{order.finalAmount}
                      </td>

                      <td className="py-3 px-4">
                        <StatusPill status={order.status} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {['placed', 'accepted', 'preparing'].includes(order.status) && (
                            <button
                              onClick={() => handleCancelByAdmin(order._id)}
                              className="px-2.5 py-1 text-red-600 hover:bg-red-50 text-[11px] font-bold rounded-lg border border-red-200"
                            >
                              Cancel & Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOrdersPage;

