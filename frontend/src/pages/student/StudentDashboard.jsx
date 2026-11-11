import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../api/client';
import FoodCard from '../../components/student/FoodCard';
import StatusPill from '../../components/common/StatusPill';
import QRCodeModal from '../../components/student/QRCodeModal';
import {
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  Wallet,
  Clock,
  QrCode,
  Calendar,
  Tag,
  Flame,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
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
        setFeaturedDishes(dishesRes.data.data.filter((d) => d.isFeatured || d.rating >= 4.8).slice(0, 4));
      }

      if (ordersRes.data.success) {
        // Active orders: placed, accepted, preparing, ready
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

  // Meal window detector
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning', meal: 'Breakfast', icon: '🌅' };
    if (hour < 16) return { text: 'Good afternoon', meal: 'Lunch', icon: '☀️' };
    if (hour < 19) return { text: 'Good evening', meal: 'Snacks', icon: '☕' };
    if (hour < 22) return { text: 'Dinner time', meal: 'Dinner', icon: '🌙' };
    return { text: 'Late night craving', meal: 'Late-Night Snacks', icon: '✨' };
  };

  const greeting = getGreeting();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700 text-amber-300 text-xs font-semibold">
              <span>{greeting.icon}</span>
              <span>{greeting.meal} Session Now Serving</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {greeting.text}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl font-normal">
              Skip the long queues at the canteen counter. Pre-order your meals, select your slot, and collect with a quick QR scan.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Wallet Quick Card */}
            <Link
              to="/student/wallet"
              className="p-4 bg-stone-800/90 hover:bg-stone-800 border border-stone-700 rounded-2xl flex items-center gap-3 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Wallet Balance</p>
                <p className="text-xl font-black text-white font-mono">₹{user?.walletBalance || 0}</p>
              </div>
            </Link>

            <Link
              to="/student/menu"
              className="px-5 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Order Spotlight / QR Pass Card */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping"></span>
              Live Order in Progress ({activeOrders.length})
            </h2>
            <Link to="/student/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View All Orders →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-amber-200/80 p-5 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-stone-900">
                          Order #{order.orderNumber}
                        </span>
                        <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {order.pickupToken}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        Pickup Window: {order.slotDisplay?.startTime} – {order.slotDisplay?.endTime}
                      </p>
                    </div>

                    <StatusPill status={order.status} />
                  </div>

                  <div className="py-3 text-xs text-stone-700 font-medium space-y-1">
                    {order.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{i.name} × {i.quantity}</span>
                        <span className="font-semibold text-stone-900">₹{i.subtotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQR(order)}
                    className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4 text-brand-400" />
                    Show Counter QR Pass
                  </button>

                  <Link
                    to={`/student/orders/${order._id}`}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors"
                  >
                    Track Live
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements & Offers Banner */}
      {announcements.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className="p-5 rounded-3xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/60 shadow-soft flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Tag className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
                    {ann.badgeText || 'Special Offer'}
                  </span>
                  {ann.couponCode && (
                    <span className="text-xs font-mono font-bold bg-white text-stone-900 px-2 py-0.5 rounded border border-amber-200">
                      Use: {ann.couponCode}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-stone-900">{ann.title}</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{ann.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popular & Featured Meals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-brand-500" />
              Popular in Campus Today
            </h2>
            <p className="text-xs text-stone-500">Student favourites freshly prepared for today's meal sessions</p>
          </div>
          <Link
            to="/student/menu"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">Loading dishes...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredDishes.map((dish) => (
              <FoodCard key={dish._id} dish={dish} />
            ))}
          </div>
        )}
      </div>

      {/* Mess Menu & Meal Pass Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/student/meal-plans"
          className="p-5 rounded-3xl bg-white border border-stone-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Prepaid Mess Passes</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Save up to 25% on weekly and monthly mess plans with meal skip options.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 mt-4 flex items-center gap-1">
            View Plans & Credits →
          </span>
        </Link>

        <Link
          to="/student/calendar"
          className="p-5 rounded-3xl bg-white border border-stone-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Weekly Mess Calendar</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Check upcoming breakfast, lunch, and dinner schedules for the whole week.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700 mt-4 flex items-center gap-1">
            Check Calendar →
          </span>
        </Link>

        <Link
          to="/student/group-order"
          className="p-5 rounded-3xl bg-white border border-stone-100 shadow-soft hover:shadow-card transition-all flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-stone-900">Hostel Group Orders</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Order together with hostel roommates and pick up with a unified counter token.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-600 mt-4 flex items-center gap-1">
            Start Group Meal →
          </span>
        </Link>
      </div>

      {/* QR Code Pass Modal */}
      <QRCodeModal
        isOpen={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        order={selectedQR}
      />
    </div>
  );
};

export default StudentDashboard;
