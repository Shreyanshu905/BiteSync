import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Check,
  Send,
  CalendarX,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

const MealPlansPage = () => {
  const { user, updateWalletBalance } = useAuth();
  const [plans, setPlans] = useState([]);
  const [credits, setCredits] = useState([]);
  const [skippedMeals, setSkippedMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transfer form state
  const [transferStudentId, setTransferStudentId] = useState('');
  const [transferQty, setTransferQty] = useState(1);
  const [transferMsg, setTransferMsg] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Skip meal state
  const [skipDate, setSkipDate] = useState(new Date().toISOString().split('T')[0]);
  const [skipPeriod, setSkipPeriod] = useState('lunch');
  const [skipReason, setSkipReason] = useState('Not at hostel');
  const [skipLoading, setSkipLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, creditsRes, skipsRes] = await Promise.all([
        api.get('/meal-plans'),
        api.get('/meal-plans/my-credits'),
        api.get('/meal-plans/skipped-meals'),
      ]);

      if (plansRes.data.success) setPlans(plansRes.data.data);
      if (creditsRes.data.success) setCredits(creditsRes.data.data);
      if (skipsRes.data.success) setSkippedMeals(skipsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    if ((user?.walletBalance || 0) < plan.price) {
      toast.error(`Insufficient wallet balance. You need ₹${plan.price}. Please top up your wallet.`);
      return;
    }

    if (!window.confirm(`Confirm subscribing to ${plan.name} for ₹${plan.price}?`)) return;

    try {
      const res = await api.post(`/meal-plans/${plan._id}/subscribe`);
      if (res.data.success) {
        toast.success(res.data.message);
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        updateWalletBalance((user?.walletBalance || 0) - plan.price);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferStudentId.trim()) {
      toast.error('Please enter recipient Student ID');
      return;
    }

    setTransferLoading(true);
    try {
      const res = await api.post('/meal-plans/transfer-credits', {
        recipientStudentId: transferStudentId.trim().toUpperCase(),
        quantity: Number(transferQty),
        message: transferMsg,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setTransferStudentId('');
        setTransferMsg('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleSkipMeal = async (e) => {
    e.preventDefault();
    setSkipLoading(true);
    try {
      const res = await api.post('/meal-plans/skip-meal', {
        date: skipDate,
        mealPeriod: skipPeriod,
        reason: skipReason,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record meal skip');
    } finally {
      setSkipLoading(false);
    }
  };

  const totalActiveCredits = credits.reduce((acc, c) => acc + c.remainingCredits, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Hostel Meal Plans & Credit Passes 🍱
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Subscribe to mess plans, skip upcoming meals to prevent waste, or transfer credits to friends.
        </p>
      </div>

      {/* Credits Balance Showcase */}
      <div className="bg-linear-to-r from-emerald-900 via-stone-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Active Subscriptions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Remaining Meal Credits: <span className="text-emerald-400 font-mono">{totalActiveCredits}</span>
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-md">
            Credits can be redeemed at checkout with 1 click instead of paying per meal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700 text-xs text-stone-300">
            <p className="text-[10px] text-stone-400 font-bold uppercase">Active Plans</p>
            <p className="text-base font-bold text-white mt-0.5">{credits.length} Plans Active</p>
          </div>
        </div>
      </div>

      {/* Available Plans Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-stone-900">Available Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full">
                    {plan.planType}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {plan.savingsText}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mt-3">{plan.name}</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{plan.description}</p>

                <div className="my-4 pt-3 border-t border-stone-100 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-stone-900 font-mono">₹{plan.price}</span>
                  <span className="text-xs text-stone-400">/ {plan.durationDays} days</span>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Includes {plan.mealCreditsCount} meal credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Valid across {plan.allowedMealTypes?.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Free cancellation before slot deadline</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                className="mt-6 w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Subscribe • ₹{plan.price}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Features: Meal Skip & Community Credit Sharing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meal Skip Feature */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CalendarX className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Mark Meal as Skipped (Reduce Wastage)
              </h3>
              <p className="text-xs text-stone-500">
                Heading home or dining outside? Mark your skipped meal so the canteen kitchen doesn't over-prepare.
              </p>
            </div>
          </div>

          <form onSubmit={handleSkipMeal} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={skipDate}
                  onChange={(e) => setSkipDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Meal Session
                </label>
                <select
                  value={skipPeriod}
                  onChange={(e) => setSkipPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Reason
              </label>
              <input
                type="text"
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                placeholder="Going home for weekend, project meet, etc."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={skipLoading}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {skipLoading ? 'Recording...' : 'Record Meal Skip'}
            </button>
          </form>

          {skippedMeals.length > 0 && (
            <div className="pt-2 border-t border-stone-100 text-xs">
              <span className="font-bold text-stone-500 block mb-1">Recently Skipped:</span>
              <div className="space-y-1">
                {skippedMeals.slice(0, 3).map((s) => (
                  <div key={s._id} className="flex justify-between text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg">
                    <span>{s.date} ({s.mealPeriod})</span>
                    <span className="text-stone-400 truncate max-w-[150px]">{s.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Community Credit Sharing / Meal Transfer */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Community Food Sharing / Transfer
              </h3>
              <p className="text-xs text-stone-500">
                Transfer eligible prepaid meal credits to a hostel friend using their Student ID.
              </p>
            </div>
          </div>

          <form onSubmit={handleTransfer} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Recipient Student ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STU-2024-002"
                  value={transferStudentId}
                  onChange={(e) => setTransferStudentId(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Credits Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={transferQty}
                  onChange={(e) => setTransferQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Optional Note / Message
              </label>
              <input
                type="text"
                value={transferMsg}
                onChange={(e) => setTransferMsg(e.target.value)}
                placeholder="Enjoy lunch today!"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={transferLoading || totalActiveCredits < 1}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {transferLoading ? (
                'Processing Transfer...'
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Transfer {transferQty} Meal Credit(s)</span>
                </>
              )}
            </button>
          </form>

          {totalActiveCredits === 0 && (
            <p className="text-[11px] text-amber-600 text-center font-medium">
              You need an active subscription pass to share credits.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlansPage;

