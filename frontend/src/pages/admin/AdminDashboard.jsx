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
  CheckCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
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

      <main className="flex-1 p-6 sm:p-8 space-y-8 max-w-7xl mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Canteen Management Overview 📊
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Live operational metrics, confirmed demand and financial insights.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/menu"
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Manage Menu
            </Link>
            <Link
              to="/admin/analytics"
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Demand Prediction
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs uppercase font-bold tracking-wider">Today's Revenue</span>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
              ₹{stats?.todayRevenue || 0}
            </div>
            <p className="text-[11px] text-stone-400 font-medium">
              Total lifetime: ₹{stats?.totalRevenue || 0}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs uppercase font-bold tracking-wider">Today's Orders</span>
              <ShoppingBag className="w-5 h-5 text-brand-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
              {stats?.todayOrders || 0}
            </div>
            <p className="text-[11px] text-stone-400 font-medium">
              {stats?.completedOrders || 0} collected • {stats?.pendingOrders || 0} in kitchen
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs uppercase font-bold tracking-wider">Active Students</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
              {stats?.activeStudents || 0}
            </div>
            <p className="text-[11px] text-stone-400 font-medium">
              Verified hostel residents
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-soft space-y-2">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs uppercase font-bold tracking-wider">Low Stock Alerts</span>
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              {stats?.lowStockCount || 0} Items
            </div>
            <Link to="/admin/inventory" className="text-[11px] text-amber-700 font-bold hover:underline block">
              View Inventory Checklist →
            </Link>
          </div>
        </div>

        {/* Sales & Orders Trends Chart (Recharts) */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-stone-900">7-Day Canteen Sales & Order Volume</h2>
              <p className="text-xs text-stone-400">Daily revenue trends from confirmed pre-orders</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Live Recharts Data
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5C38" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF5C38" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1ece7" />
                <XAxis dataKey="date" stroke="#8c827a" fontSize={11} />
                <YAxis stroke="#8c827a" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF5C38"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue (₹)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Dishes & Quick Shortcuts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Best Selling Dishes */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-bold text-sm uppercase tracking-wider text-stone-500 flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand-500" />
                Top Demanded Canteen Dishes
              </h3>
              <Link to="/admin/menu" className="text-xs font-bold text-brand-600 hover:text-brand-700">
                Menu Details →
              </Link>
            </div>

            <div className="divide-y divide-stone-100">
              {popularDishes.slice(0, 5).map((dish, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 font-bold flex items-center justify-center font-mono">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-stone-900 text-sm">{dish._id}</span>
                  </div>

                  <div className="flex items-center gap-4 text-stone-600">
                    <span className="font-semibold">{dish.totalQuantity} Portions Sold</span>
                    <span className="font-black text-stone-900 font-mono">₹{dish.totalRevenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Admin Actions */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-soft space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-stone-500">
              Quick Admin Actions
            </h3>

            <div className="space-y-2.5">
              <Link
                to="/admin/slots"
                className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl flex items-center justify-between text-xs font-semibold text-stone-800 transition-colors"
              >
                <span>Adjust Pickup Slot Capacities</span>
                <Clock className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                to="/admin/inventory"
                className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl flex items-center justify-between text-xs font-semibold text-stone-800 transition-colors"
              >
                <span>Restock Kitchen Ingredients</span>
                <Package className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                to="/admin/offers"
                className="p-3 bg-stone-50 hover:bg-stone-100 rounded-2xl flex items-center justify-between text-xs font-semibold text-stone-800 transition-colors"
              >
                <span>Publish Hostel Coupon Code</span>
                <TrendingUp className="w-4 h-4 text-stone-400" />
              </Link>

              <Link
                to="/admin/analytics"
                className="p-3 bg-brand-50 hover:bg-brand-100 rounded-2xl flex items-center justify-between text-xs font-bold text-brand-800 transition-colors"
              >
                <span>Food Waste Reduction & Demand Insights</span>
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
