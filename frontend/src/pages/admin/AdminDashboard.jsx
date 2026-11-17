import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import AdminSidebar from '../../components/admin/AdminSidebar';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [overviewRes, trendsRes, dishesRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/sales-trends?days=7'),
        api.get('/analytics/dish-popularity'),
      ]);

      if (overviewRes.data.success) setStats(overviewRes.data.data);
      if (trendsRes.data.success) setTrends(trendsRes.data.data);
      if (dishesRes.data.success) setPopularDishes(dishesRes.data.popularDishes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
              Operations Overview
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Live canteen metrics, confirmed pre-order demand, and revenue summary.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/menu"
              className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/80 font-medium text-xs rounded-lg transition-colors"
            >
              Manage Menu
            </Link>
            <Link
              to="/admin/analytics"
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-lg transition-colors"
            >
              Demand Forecast
            </Link>
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-medium text-stone-500">Today's Revenue</span>
              <TrendingUp className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-semibold text-stone-900 tabular-nums">
              ₹{stats?.todayRevenue || 0}
            </div>
            <p className="text-[11px] text-stone-400">
              Lifetime total: ₹{stats?.totalRevenue || stats?.todayRevenue || 0}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-medium text-stone-500">Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-semibold text-stone-900 tabular-nums">
              {stats?.totalOrders || stats?.todayOrders || 0}
            </div>
            <p className="text-[11px] text-stone-400">
              {stats?.completedOrders || 0} collected · {stats?.pendingOrders || 0} in kitchen
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-medium text-stone-500">Active Students</span>
              <Users className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-semibold text-stone-900 tabular-nums">
              {stats?.activeStudents || 0}
            </div>
            <p className="text-[11px] text-stone-400">
              Verified hostel residents
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs font-medium text-stone-500">Low Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-semibold text-stone-900 tabular-nums">
              {stats?.lowStockCount || 0} <span className="text-sm font-normal text-stone-400">items</span>
            </div>
            <Link to="/admin/inventory" className="text-[11px] text-stone-600 hover:text-stone-900 font-medium block">
              View inventory →
            </Link>
          </div>
        </div>

        {/* 7-Day Sales Trends Chart */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm text-stone-900">7-Day Revenue Trend</h2>
              <p className="text-xs text-stone-400 mt-0.5">Daily revenue from confirmed pre-orders</p>
            </div>
            <span className="text-[11px] font-medium text-stone-500 bg-cream-100 px-2.5 py-1 rounded-md">
              Last 7 days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C45B35" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#C45B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eee9" vertical={false} />
                <XAxis dataKey="date" stroke="#a8a29e" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#a8a29e" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1B1A',
                    borderRadius: '10px',
                    border: 'none',
                    color: '#FAFAF8',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C45B35"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue (₹)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Dishes & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-semibold text-sm text-stone-900">Top Ordered Dishes</h3>
              <Link to="/admin/menu" className="text-xs font-medium text-stone-500 hover:text-stone-900">
                View menu →
              </Link>
            </div>

            {popularDishes.length === 0 && !loading ? (
              <p className="text-xs text-stone-400 py-6 text-center">No order data recorded yet.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {popularDishes.slice(0, 5).map((dish, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-cream-100 text-stone-600 font-medium flex items-center justify-center font-mono text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-stone-900 text-sm">{dish._id || dish.name}</span>
                    </div>

                    <div className="flex items-center gap-4 text-stone-500 tabular-nums">
                      <span>{dish.totalQuantity || dish.ordersCount} portions</span>
                      <span className="font-semibold text-stone-900">₹{dish.totalRevenue || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-soft space-y-4">
            <h3 className="font-semibold text-sm text-stone-900">Quick Actions</h3>

            <div className="space-y-2">
              <Link
                to="/admin/slots"
                className="p-3 bg-cream-50 hover:bg-stone-100/80 border border-stone-200/60 rounded-xl flex items-center justify-between text-xs font-medium text-stone-700 transition-colors"
              >
                <span>Adjust Pickup Slot Capacities</span>
                <Clock className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                to="/admin/inventory"
                className="p-3 bg-cream-50 hover:bg-stone-100/80 border border-stone-200/60 rounded-xl flex items-center justify-between text-xs font-medium text-stone-700 transition-colors"
              >
                <span>Restock Kitchen Ingredients</span>
                <Package className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                to="/admin/offers"
                className="p-3 bg-cream-50 hover:bg-stone-100/80 border border-stone-200/60 rounded-xl flex items-center justify-between text-xs font-medium text-stone-700 transition-colors"
              >
                <span>Publish Hostel Coupon Code</span>
                <TrendingUp className="w-3.5 h-3.5 text-stone-400" />
              </Link>

              <Link
                to="/admin/analytics"
                className="p-3 bg-stone-900 hover:bg-stone-800 rounded-xl flex items-center justify-between text-xs font-medium text-white transition-colors"
              >
                <span>Demand & Waste Insights</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
