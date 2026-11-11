import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusPill from '../../components/common/StatusPill';
import QRCodeModal from '../../components/student/QRCodeModal';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  QrCode,
  Clock,
  RotateCcw,
  Star,
  XCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../context/SocketContext';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedQR, setSelectedQR] = useState(null);
  const [ratingModalOrder, setRatingModalOrder] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const { addToCart } = useCart();
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time order status updates via socket
  useEffect(() => {
    if (!socket) return;
    const handleStatusUpdate = () => {
      fetchOrders();
    };

    socket.on('order_status_updated', handleStatusUpdate);
    return () => {
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Full refund will be credited to your wallet.')) {
      return;
    }

    try {
      const res = await api.post(`/orders/${orderId}/cancel`, {
        reason: 'Cancelled by student before cutoff',
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleQuickReorder = (order) => {
    order.items.forEach((item) => {
      addToCart(
        {
          _id: item.menuItem,
          name: item.name,
          price: item.price,
          isAvailable: true,
          stockQuantity: 50,
          category: 'lunch',
        },
        item.quantity
      );
    });
    toast.success('Dishes added to your cart for quick re-order!');
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/orders/${ratingModalOrder._id}/rate`, {
        rating: ratingScore,
        feedback: ratingComment,
      });
      if (res.data.success) {
        toast.success('Thank you for rating your meal!');
        setRatingModalOrder(null);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return ['placed', 'accepted', 'preparing', 'ready'].includes(o.status);
    if (filter === 'completed') return o.status === 'collected';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            My Canteen Orders 📋
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track preparation progress, view pickup QR passes and review meal history.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-white p-1 rounded-2xl border border-stone-200/80 shadow-2xs self-start">
          {['all', 'active', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-brand-500 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-stone-400">Loading your orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8">
          <p className="font-bold text-base text-stone-800">No orders found</p>
          <p className="text-xs text-stone-400 mt-1">You haven't placed any orders in this category.</p>
          <Link
            to="/student/menu"
            className="mt-4 inline-block px-5 py-2.5 bg-brand-500 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Order Food Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const canCancel =
              ['placed', 'accepted'].includes(order.status) &&
              new Date() < new Date(order.cancellationDeadline);

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-soft hover:shadow-card transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-base text-stone-900">
                      Order #{order.orderNumber}
                    </span>
                    <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
                      Token: {order.pickupToken}
                    </span>
                    <span className="text-xs text-stone-400">•</span>
                    <span className="text-xs text-stone-500 font-medium">
                      {new Date(order.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusPill status={order.status} />
                    <span className="text-base font-black text-stone-900 font-mono">
                      ₹{order.finalAmount}
                    </span>
                  </div>
                </div>

                {/* Slot and Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-bold uppercase tracking-wider text-[10px] text-stone-400 mb-1">
                      Pickup Window & Hostel
                    </p>
                    <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      {order.slotDisplay?.startTime} – {order.slotDisplay?.endTime} ({order.slotDisplay?.mealPeriod})
                    </p>
                    <p className="text-stone-500 mt-0.5">
                      {order.hostelDetails?.hostelName} • {order.hostelDetails?.block} • Room {order.hostelDetails?.roomNumber}
                    </p>
                  </div>

                  <div>
                    <p className="font-bold uppercase tracking-wider text-[10px] text-stone-400 mb-1">
                      Ordered Items
                    </p>
                    <div className="space-y-0.5 font-medium text-stone-700">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="font-mono">₹{item.subtotal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* QR Code Pass Button */}
                    {order.status !== 'cancelled' && (
                      <button
                        onClick={() => setSelectedQR(order)}
                        className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5 text-brand-400" />
                        Counter QR Pass
                      </button>
                    )}

                    {/* Track Live Link */}
                    <Link
                      to={`/student/orders/${order._id}`}
                      className="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>Track Live</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* Reorder Button */}
                    <button
                      onClick={() => handleQuickReorder(order)}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                      title="Add items to cart again"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reorder
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Rate Meal Button */}
                    {order.status === 'collected' && !order.rating && (
                      <button
                        onClick={() => setRatingModalOrder(order)}
                        className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Rate Meal
                      </button>
                    )}

                    {order.rating && (
                      <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500" />
                        Rated {order.rating}/5
                      </span>
                    )}

                    {/* Cancel Button */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl border border-red-200 transition-colors"
                      >
                        Cancel & Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Pass Modal */}
      <QRCodeModal
        isOpen={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        order={selectedQR}
      />

      {/* Star Rating Modal */}
      {ratingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-100 text-center">
            <h3 className="font-black text-lg text-stone-900">Rate Your Meal 🌟</h3>
            <p className="text-xs text-stone-500 mt-1">
              How was your food for order #{ratingModalOrder.orderNumber}?
            </p>

            <form onSubmit={handleSubmitRating} className="mt-4 space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingScore
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                rows="3"
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Share feedback on taste, portion or hygiene..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              ></textarea>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRatingModalOrder(null)}
                  className="flex-1 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

