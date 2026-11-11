import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import OrderCard from '../../components/kitchen/OrderCard';
import PrepSheetModal from '../../components/kitchen/PrepSheetModal';
import ScannerCamera from '../../components/kitchen/ScannerCamera';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import {
  ChefHat,
  QrCode,
  FileSpreadsheet,
  RefreshCw,
  Clock,
  Filter,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('active');
  const [isPrepSheetOpen, setIsPrepSheetOpen] = useState(false);
  const [scannerModalToken, setScannerModalToken] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrders();
  }, [filterPeriod, filterStatus]);

  // Real-time socket events for kitchen
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      fetchOrders();
    };

    socket.on('order_placed', handleNewOrder);
    socket.on('order_status_updated', handleNewOrder);
    socket.on('order_collected', handleNewOrder);

    return () => {
      socket.off('order_placed', handleNewOrder);
      socket.off('order_status_updated', handleNewOrder);
      socket.off('order_collected', handleNewOrder);
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterPeriod !== 'all') params.mealPeriod = filterPeriod;
      if (filterStatus === 'active') params.status = 'placed,accepted,preparing';

      const res = await api.get('/orders/all', { params });
      if (res.data.success) {
        let fetched = res.data.data;
        if (filterStatus === 'active') {
          fetched = fetched.filter((o) => ['placed', 'accepted', 'preparing'].includes(o.status));
        } else if (filterStatus === 'ready') {
          fetched = fetched.filter((o) => o.status === 'ready');
        }
        setOrders(fetched);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load kitchen order queue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchOrders();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleReportDelay = async () => {
    const mins = window.prompt('Enter estimated prep delay in minutes for active orders:', '10');
    if (!mins) return;

    try {
      const res = await api.post('/kitchen/report-delay', { delayMinutes: Number(mins) });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to broadcast delay alert');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Live Kitchen Dashboard 👨‍🍳
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time preparation queue sorted by upcoming pickup slot windows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Prep Sheet Button */}
          <button
            onClick={() => setIsPrepSheetOpen(true)}
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            <span>Preparation Summary Sheet</span>
          </button>

          {/* QR Scanner Link */}
          <Link
            to="/kitchen/scanner"
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <QrCode className="w-4 h-4 text-brand-400" />
            <span>Open Counter QR Scanner</span>
          </Link>

          {/* Report Delay Button */}
          <button
            onClick={handleReportDelay}
            className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200"
            title="Broadcast kitchen rush delay to students"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-soft flex flex-wrap items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'active'
                ? 'bg-brand-500 text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Active Cooking Queue ({orders.filter((o) => ['placed', 'accepted', 'preparing'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setFilterStatus('ready')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'ready'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Ready for Pickup
          </button>
        </div>

        {/* Meal Period Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
          >
            <option value="all">All Meal Sessions</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snacks">Snacks</option>
            <option value="dinner">Dinner</option>
            <option value="late-night">Late-Night</option>
          </select>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Syncing incoming orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-stone-200/80 p-8 space-y-2">
          <PackageCheck className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="font-bold text-base text-stone-800">Kitchen Queue is Clear! 🎉</p>
          <p className="text-xs text-stone-400">All pre-orders for this session have been prepared.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onUpdateStatus={handleUpdateStatus}
              onOpenQRScanner={(token) => setScannerModalToken(token)}
            />
          ))}
        </div>
      )}

      {/* Prep Sheet Summary Modal */}
      <PrepSheetModal
        isOpen={isPrepSheetOpen}
        onClose={() => setIsPrepSheetOpen(false)}
      />

      {/* Direct Counter Verification Modal */}
      {scannerModalToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <ScannerCamera
            initialToken={scannerModalToken}
            onCollectedSuccess={() => {
              setScannerModalToken(null);
              fetchOrders();
            }}
            onClose={() => setScannerModalToken(null)}
          />
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;
