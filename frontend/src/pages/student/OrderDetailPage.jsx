import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { QRCodeSVG } from 'qrcode.react';
import StatusPill from '../../components/common/StatusPill';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  PackageCheck,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Listen for real-time order updates via Socket.IO
  useEffect(() => {
    if (!socket || !order) return;

    const handleUpdate = (data) => {
      if (data.orderId === order._id || data.order?._id === order._id) {
        fetchOrder();
      }
    };

    socket.on('order_status_updated', handleUpdate);
    socket.on('order_collected', handleUpdate);

    return () => {
      socket.off('order_status_updated', handleUpdate);
      socket.off('order_collected', handleUpdate);
    };
  }, [socket, order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this pre-order? Your payment will be refunded immediately.')) return;
    try {
      const res = await api.post(`/orders/${order._id}/cancel`, {
        reason: 'Cancelled from tracking screen',
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOrder();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Syncing live order tracking...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="font-bold text-stone-800">Order not found</p>
        <Link to="/student/orders" className="text-xs text-brand-600 font-bold mt-2 inline-block">
          ← Return to Orders
        </Link>
      </div>
    );
  }

  // 5 Order states: placed -> accepted -> preparing -> ready -> collected
  const steps = [
    { key: 'placed', label: 'Placed', icon: ShoppingBag, time: order.statusTimestamps?.placedAt },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2, time: order.statusTimestamps?.acceptedAt },
    { key: 'preparing', label: 'Cooking', icon: ChefHat, time: order.statusTimestamps?.preparingAt },
    { key: 'ready', label: 'Ready for Pickup', icon: PackageCheck, time: order.statusTimestamps?.readyAt },
    { key: 'collected', label: 'Collected', icon: ShieldCheck, time: order.statusTimestamps?.collectedAt },
  ];

  const statusOrder = ['placed', 'accepted', 'preparing', 'ready', 'collected'];
  const currentIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  const canCancel =
    ['placed', 'accepted'].includes(order.status) &&
    new Date() < new Date(order.cancellationDeadline);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/student/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-card space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-stone-900">
                Order #{order.orderNumber}
              </h1>
              <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md border border-amber-200">
                Token: {order.pickupToken}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              Placed on {new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>

          <StatusPill status={order.status} />
        </div>

        {/* Live Multi-Step Tracker Bar */}
        {!isCancelled ? (
          <div className="py-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-6 text-center">
              Live Preparation Timeline
            </h3>

            <div className="relative flex items-center justify-between max-w-2xl mx-auto">
              {/* Background Connecting Line */}
              <div className="absolute top-5 left-6 right-6 h-1 bg-stone-100 -z-0"></div>

              {/* Active Connecting Line */}
              <div
                className="absolute top-5 left-6 h-1 bg-brand-500 transition-all duration-500 -z-0"
                style={{
                  width: `${(currentIndex / (steps.length - 1)) * 90}%`,
                }}
              ></div>

              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = currentIndex >= idx;
                const isCurrent = currentIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-brand-500 text-white ring-4 ring-brand-500/20 scale-110 shadow-md'
                          : isCompleted
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-xs mt-2 font-bold ${
                        isCurrent
                          ? 'text-brand-600'
                          : isCompleted
                          ? 'text-stone-900'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </span>

                    {step.time && (
                      <span className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-xs">
            <p className="font-bold">Order Cancelled</p>
            <p className="mt-0.5">{order.cancellationReason || 'Cancelled before preparation window.'}</p>
          </div>
        )}

        {/* Counter QR Pass Showcase */}
        {order.status !== 'cancelled' && (
          <div className="bg-amber-50/60 rounded-3xl border border-amber-200/80 p-6 flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="space-y-2 text-center sm:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Digital Pickup Pass
              </span>
              <h3 className="text-xl font-black text-stone-900">
                Token: <span className="font-mono text-brand-600">{order.pickupToken}</span>
              </h3>
              <p className="text-xs text-stone-600 max-w-sm">
                Present this QR code or announce your pickup token at counter slot <span className="font-bold text-stone-900">{order.slotDisplay?.startTime}–{order.slotDisplay?.endTime}</span>.
              </p>
              <div className="text-[11px] text-stone-500 font-medium">
                Hostel: {order.hostelDetails?.hostelName} • Block {order.hostelDetails?.block} • Room {order.hostelDetails?.roomNumber}
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-amber-300 shadow-xs shrink-0 text-center">
              <QRCodeSVG
                value={order.qrCodeData || order.pickupToken}
                size={140}
                level="H"
                includeMargin={true}
              />
              <span className="text-[10px] font-mono font-bold text-stone-500 block mt-1">
                Scan at Counter
              </span>
            </div>
          </div>
        )}

        {/* Items Summary & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Ordered Dishes
            </h4>
            <div className="divide-y divide-stone-100 border border-stone-100 rounded-2xl p-4 bg-stone-50/50 space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-900">{item.name}</span>
                    <span className="text-stone-400 ml-1">× {item.quantity}</span>
                  </div>
                  <span className="font-mono font-bold text-stone-900">₹{item.subtotal}</span>
                </div>
              ))}

              <div className="pt-3 border-t border-stone-200 flex justify-between font-black text-sm text-stone-900">
                <span>Total Paid</span>
                <span className="font-mono text-brand-600">₹{order.finalAmount}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Pickup & Payment Details
            </h4>
            <div className="border border-stone-100 rounded-2xl p-4 bg-stone-50/50 space-y-2 text-xs text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Pickup Slot:</span>
                <span className="font-bold text-stone-900">{order.slotDisplay?.startTime} – {order.slotDisplay?.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Meal Window:</span>
                <span className="capitalize font-semibold">{order.slotDisplay?.mealPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Mode:</span>
                <span className="capitalize font-mono font-semibold">{order.paymentMethod?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Transaction Ref:</span>
                <span className="font-mono text-[11px]">{order.paymentDetails?.transactionId || 'TXN-OK'}</span>
              </div>
            </div>

            {canCancel && (
              <div className="pt-2">
                <button
                  onClick={handleCancel}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors"
                >
                  Cancel Order & Request Full Refund
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

