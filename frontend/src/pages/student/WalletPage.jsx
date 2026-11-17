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
        fetchWallet();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Top up failed');
    } finally {
      setTopUpLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
          Student Wallet
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Instant canteen checkout, automated cancellation refunds, and transaction history.
        </p>
      </div>

      {/* Balance Card & Quick Top-up */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Balance Card */}
        <div className="md:col-span-1 bg-stone-900 text-white rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-[11px] uppercase font-medium tracking-wider">Balance</span>
              <Wallet className="w-4 h-4 text-stone-400" />
            </div>
            <div className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-white">
              ₹{balance}
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              ID <span className="font-mono text-stone-200">{user?.studentId}</span>
            </p>
          </div>

          <div className="pt-5 mt-6 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </span>
            <span>{user?.hostel?.block}</span>
          </div>
        </div>

        {/* Top-up card */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-soft space-y-4">
          <div>
            <h3 className="font-medium text-sm text-stone-900">
              Add Funds
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Select a preset or custom amount to top up your canteen wallet.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopUpAmount(amt)}
                className={`py-2 rounded-lg text-xs font-medium border transition-colors tabular-nums ${
                  topUpAmount === amt
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-cream-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                +₹{amt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-stone-400 text-sm font-medium">₹</span>
              <input
                type="number"
                min="10"
                max="5000"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
                className="w-full pl-7 pr-3.5 py-2 bg-cream-50/70 border border-stone-200 rounded-lg text-sm font-medium tabular-nums focus:bg-white focus:outline-none focus:border-stone-400 transition-colors"
              />
            </div>

            <button
              onClick={() => handleTopUp(topUpAmount)}
              disabled={topUpLoading || !topUpAmount}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              {topUpLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Money</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="font-semibold text-sm text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-stone-400" />
            Transaction History
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
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50/80 text-emerald-700'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div>
                      <p className="font-medium text-stone-900">{tx.description}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} · {tx.referenceId}
                      </p>
                    </div>
                  </div>

                  <div className="text-right tabular-nums">
                    <span
                      className={`font-semibold text-sm ${
                        isCredit ? 'text-emerald-700' : 'text-stone-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount}
                    </span>
                    <p className="text-[10px] text-stone-400">
                      Bal ₹{tx.balanceAfter}
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

