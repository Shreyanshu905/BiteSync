import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
  ShieldCheck,
  CreditCard,
  History,
} from 'lucide-react';

const WalletPage = () => {
  const { user, updateWalletBalance } = useAuth();
  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [transactions, setTransactions] = useState([]);
  const [topUpAmount, setTopUpAmount] = useState(250);
  const [loading, setLoading] = useState(true);
  const [topUpLoading, setTopUpLoading] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wallet');
      if (res.data.success) {
        setBalance(res.data.balance);
        setTransactions(res.data.transactions || []);
        updateWalletBalance(res.data.balance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (amountToAdd) => {
    setTopUpLoading(true);
    try {
      const res = await api.post('/wallet/topup', {
        amount: amountToAdd,
        paymentMethod: 'upi',
      });

      if (res.data.success) {
        setBalance(res.data.balance);
        updateWalletBalance(res.data.balance);
        toast.success(res.data.message);

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });

        fetchWallet();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Top up failed');
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Student Digital Wallet 💳
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Instant canteen checkout, automated cancellation refunds and top-up pass.
        </p>
      </div>

      {/* Balance Card & Quick Top-up */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="md:col-span-1 bg-linear-to-br from-stone-900 via-stone-800 to-stone-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs uppercase font-bold tracking-wider">Canteen Balance</span>
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <div className="mt-4 text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              ₹{balance}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              Active student ID: <span className="font-mono text-stone-200">{user?.studentId}</span>
            </p>
          </div>

          <div className="pt-6 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              Verified Account
            </span>
            <span>Hostel: {user?.hostel?.block}</span>
          </div>
        </div>

        {/* Top-up card */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-4">
          <div>
            <h3 className="font-bold text-base text-stone-900">
              Instant Wallet Recharge (Demo Gateway / UPI)
            </h3>
            <p className="text-xs text-stone-500">
              Select an amount below to simulate a digital top-up verified by backend.
            </p>
          </div>

          {/* Quick preset buttons */}
          <div className="grid grid-cols-4 gap-2.5">
            {[100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopUpAmount(amt)}
                className={`py-2.5 rounded-2xl text-xs font-bold border transition-all ${
                  topUpAmount === amt
                    ? 'bg-brand-500 text-white border-brand-500 shadow-2xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                +₹{amt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-2.5 text-stone-400 text-sm font-bold font-mono">₹</span>
              <input
                type="number"
                min="10"
                max="5000"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              onClick={() => handleTopUp(topUpAmount)}
              disabled={topUpLoading || !topUpAmount}
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              {topUpLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Money</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="font-bold text-sm uppercase tracking-wider text-stone-500 flex items-center gap-2">
            <History className="w-4 h-4 text-brand-600" />
            Wallet Transaction Ledger
          </h3>
          <span className="text-xs text-stone-400">{transactions.length} records</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-stone-400">Loading ledger...</div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-xs text-stone-400">No transactions recorded yet.</div>
        ) : (
          <div className="divide-y divide-stone-100">
            {transactions.map((tx) => {
              const isCredit = ['topup', 'refund'].includes(tx.type);

              return (
                <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-stone-900">{tx.description}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} • Ref: {tx.referenceId}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-black font-mono text-sm ${
                        isCredit ? 'text-emerald-600' : 'text-stone-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount}
                    </span>
                    <p className="text-[10px] text-stone-400 font-mono">
                      Bal: ₹{tx.balanceAfter}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
