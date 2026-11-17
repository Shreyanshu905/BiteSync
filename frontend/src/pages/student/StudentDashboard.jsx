import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import FoodCard from '../../components/student/FoodCard';
import StatusPill from '../../components/common/StatusPill';
import QRCodeModal from '../../components/student/QRCodeModal';
import {
  UtensilsCrossed,
  ArrowRight,
  Wallet,
  Clock,
  QrCode,
  Calendar,
  Tag,
  ChevronRight,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dishesRes, ordersRes, noticesRes] = await Promise.all([
        api.get('/menu'),
        api.get('/orders/my'),
        api.get('/announcements', { params: { hostel: user?.hostel?.hostelName } }),
      ]);

      if (dishesRes.data.success) {
        setFeaturedDishes(
          dishesRes.data.data.filter((d) => d.isFeatured || d.rating >= 4.8).slice(0, 4)
        );
      }

      if (ordersRes.data.success) {
        const active = ordersRes.data.data.filter((o) =>
          ['placed', 'accepted', 'preparing', 'ready'].includes(o.status)
        );
        setActiveOrders(active);
      }

      if (noticesRes.data.success) {
        setAnnouncements(noticesRes.data.data.slice(0, 2));
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', meal: 'Breakfast' };
    if (hour < 16) return { text: 'Good afternoon', meal: 'Lunch' };
    if (hour < 19) return { text: 'Good evening', meal: 'Evening Snacks' };
    if (hour < 22) return { text: 'Good evening', meal: 'Dinner' };
    return { text: 'Late night', meal: 'Late-Night Canteen' };
  };

  const greeting = getGreeting();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Quiet Editorial Welcome Header */}
      <section className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-stone-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/80"></span>
              <span>{greeting.meal} session open</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900">
              {greeting.text}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-stone-500 text-sm max-w-lg leading-relaxed">
              Pre-order freshly prepared hostel meals, reserve a 15-minute pickup window, and collect with your QR pass.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/student/wallet"
              className="px-4 py-2.5 bg-cream-50 hover:bg-stone-100/80 border border-stone-200/80 rounded-xl flex items-center gap-3 transition-colors"
            >
              <Wallet className="w-4 h-4 text-stone-500" />
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">Wallet</p>
                <p className="text-sm font-semibold text-stone-900 tabular-nums">₹{user?.walletBalance || 0}</p>
              </div>
            </Link>

            <Link
              to="/student/menu"
              className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm rounded-xl transition-colors flex items-center gap-2"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 radar-live"></span>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Active Orders ({activeOrders.length})
              </h2>
            </div>
            <Link
              to="/student/orders"
              className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
            >
              View all orders →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-soft hover:border-stone-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-3.5 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-stone-900">
                          Order #{order.orderNumber}
                        </span>
                        <span className="font-mono text-xs font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                          {order.pickupToken}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>
                          Pickup {order.slotDisplay?.startTime} – {order.slotDisplay?.endTime}
                        </span>
                      </p>
                    </div>

                    <StatusPill status={order.status} />
                  </div>

                  <div className="py-3.5 text-xs text-stone-600 space-y-1.5">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {i.name} <span className="text-stone-400">× {i.quantity}</span>
                        </span>
                        <span className="font-medium text-stone-800 tabular-nums">₹{i.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQR(order)}
                    className="flex-1 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-stone-300" />
                    Show QR Pass
                  </button>

                  <Link
                    to={`/student/orders/${order._id}`}
                    className="px-3.5 py-2 bg-cream-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 font-medium text-xs rounded-lg transition-colors"
                  >
                    Track
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Subtle Announcements & Offers */}
      {announcements.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className="p-4 sm:p-5 rounded-2xl bg-cream-100/70 border border-stone-200/75 flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-stone-200/80 text-brand-600 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                    {ann.badgeText || 'Notice'}
                  </span>
                  {ann.couponCode && (
                    <span className="text-[11px] font-mono font-medium bg-white text-stone-700 px-2 py-0.5 rounded-md border border-stone-200/80">
                      {ann.couponCode}
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-sm text-stone-900">{ann.title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{ann.description}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Popular Meals */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold text-stone-900 tracking-tight">
              Popular today
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Freshly prepared favourites from today's kitchen sessions
            </p>
          </div>
          <Link
            to="/student/menu"
            className="text-xs font-medium text-stone-600 hover:text-stone-900 flex items-center gap-0.5 transition-colors"
          >
            <span>Full menu</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">Loading menu...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredDishes.map((dish) => (
              <FoodCard key={dish._id} dish={dish} />
            ))}
          </div>
        )}
      </section>

      {/* Secondary Shortcuts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/student/calendar"
          className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 shadow-soft transition-colors flex items-start justify-between gap-4 group"
        >
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-cream-100 text-stone-600 flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-sm text-stone-900">Weekly Mess Calendar</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              View upcoming breakfast, lunch, and dinner schedules for the week.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors mt-1 shrink-0" />
        </Link>

        <Link
          to="/student/group-order"
          className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-stone-300 shadow-soft transition-colors flex items-start justify-between gap-4 group"
        >
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-cream-100 text-stone-600 flex items-center justify-center mb-2">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <h3 className="font-medium text-sm text-stone-900">Hostel Group Orders</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Order together with roommates and collect with a single pickup token.
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-600 transition-colors mt-1 shrink-0" />
        </Link>
      </section>

      <QRCodeModal
        isOpen={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        order={selectedQR}
      />
    </div>
  );
};

export default StudentDashboard;
