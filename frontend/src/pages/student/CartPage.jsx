import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import SlotSelector from '../../components/student/SlotSelector';
import api from '../../api/client';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ShieldCheck,
  CreditCard,
  Wallet,
  QrCode,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    coupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalTotal,
  } = useCart();

  const { user, updateWalletBalance } = useAuth();
  const navigate = useNavigate();

  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedSlotObj, setSelectedSlotObj] = useState(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto text-amber-700 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-stone-900">Your Cart is Empty</h2>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          Looks like you haven't added any dishes yet. Explore today's freshly prepared hostel menu!
        </p>
        <Link
          to="/student/menu"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
        >
          <span>Browse Canteen Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    applyCoupon(couponCodeInput);
    setCouponCodeInput('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedSlotId) {
      toast.error('Please select an available pickup time window!');
      return;
    }

    if (paymentMethod === 'wallet' && (user?.walletBalance || 0) < finalTotal) {
      toast.error(
        `Insufficient wallet balance (₹${user?.walletBalance || 0}). Please top-up or switch payment method.`
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          menuItemId: item.dish._id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || '',
        })),
        pickupSlotId: selectedSlotId,
        paymentMethod,
        couponCode: coupon?.code,
        notes: orderNotes,
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });

        // Deduct from local wallet context if wallet payment
        if (paymentMethod === 'wallet') {
          updateWalletBalance((user?.walletBalance || 0) - finalTotal);
        }

        toast.success('🎉 Meal pre-order placed successfully!');
        clearCart();
        navigate(`/student/orders/${res.data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place pre-order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Review Order & Select Pickup Slot 🛒
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Lock in your meal preparation and skip the queue counter.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Cart Items & Slot Selector */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items List */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-bold text-sm uppercase tracking-wider text-stone-500">
                Selected Dishes ({cartItems.length})
              </h2>
              <button
                onClick={clearCart}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {cartItems.map((item) => (
                <div key={item.dish._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.dish.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100'}
                      alt={item.dish.name}
                      className="w-14 h-14 rounded-2xl object-cover bg-stone-100 shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">{item.dish.name}</h4>
                      <p className="text-xs text-stone-400">₹{item.dish.price} each</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-stone-100 px-2 py-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.dish._id, item.quantity - 1)}
                        className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs font-bold shadow-2xs hover:bg-stone-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-xs font-mono w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.dish._id, item.quantity + 1)}
                        className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-xs font-bold shadow-2xs hover:bg-stone-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-black text-sm text-stone-900 font-mono w-14 text-right">
                      ₹{item.dish.price * item.quantity}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.dish._id)}
                      className="text-stone-400 hover:text-red-600 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pickup Slot Selection Component */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-4">
            <SlotSelector
              selectedSlotId={selectedSlotId}
              onSelectSlot={(id, slot) => {
                setSelectedSlotId(id);
                setSelectedSlotObj(slot);
              }}
              mealPeriod={cartItems[0]?.dish.category}
            />

            {/* Cancellation Deadline Notice */}
            <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/60 text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-amber-900">
                <span className="font-bold">Cancellation Policy:</span> Free instant cancellation with full wallet refund is permitted up to 15 minutes before your pickup slot begins.
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Bill Summary, Coupons & Payment */}
        <div className="space-y-6">
          {/* Coupon Code Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-soft space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-brand-600" />
              Offers & Promo Code
            </h3>

            {coupon ? (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-emerald-800">{coupon.code}</span>
                  <p className="text-emerald-700 text-[11px]">Applied! ₹{coupon.discount} discount saved.</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-emerald-800 hover:text-red-600 font-bold text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. BITESYNC10"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Apply
                </button>
              </form>
            )}

            <div className="text-[11px] text-stone-400">
              Try <span className="font-mono font-semibold text-stone-600">BITESYNC10</span> for 10% off or <span className="font-mono font-semibold text-stone-600">HOSTEL20</span> above ₹150.
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-soft space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brand-600" />
              Choose Payment Method
            </h3>

            <div className="space-y-2">
              <label
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'wallet'
                    ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Student Wallet</span>
                    <span className="text-[10px] text-stone-500">
                      Balance: ₹{user?.walletBalance || 0}
                    </span>
                  </div>
                </div>
                <Wallet className="w-4 h-4 text-brand-600" />
              </label>

              <label
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">UPI QR / GPay (Demo)</span>
                    <span className="text-[10px] text-stone-500">Instant verified UPI simulation</span>
                  </div>
                </div>
                <QrCode className="w-4 h-4 text-stone-600" />
              </label>

              <label
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'demo_gateway'
                    ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="demo_gateway"
                    checked={paymentMethod === 'demo_gateway'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-brand-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Debit / Hostel Card</span>
                    <span className="text-[10px] text-stone-500">Demo Gateway verified checkout</span>
                  </div>
                </div>
                <CreditCard className="w-4 h-4 text-stone-600" />
              </label>
            </div>
          </div>

          {/* Bill Summary Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Bill Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600">
                <span>Canteen Packaging & Pickup</span>
                <span className="font-mono text-emerald-600">FREE</span>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between items-center text-sm font-black text-stone-900">
                <span>Total Payable</span>
                <span className="text-xl font-mono text-brand-600">₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !selectedSlotId}
              className="w-full mt-4 py-3.5 bg-brand-500 hover:bg-brand-600 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Confirm Pre-Order • ₹{finalTotal}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {!selectedSlotId && (
              <p className="text-[11px] text-amber-600 text-center font-medium">
                ⚠️ Please select a pickup slot above to proceed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

