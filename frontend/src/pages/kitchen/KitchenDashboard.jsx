import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import OrderCard from '../../components/kitchen/OrderCard';
import PrepSheetModal from '../../components/kitchen/PrepSheetModal';
import ScannerCamera from '../../components/kitchen/ScannerCamera';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import {
  QrCode,
  FileSpreadsheet,
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

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = () => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600/80 radar-live"></span>
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
              Kitchen Queue
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Preparation queue sorted by upcoming pickup time windows.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPrepSheetOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs rounded-lg border border-stone-200/80 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-stone-500" />
            <span>Prep Summary</span>
          </button>

          <Link
            to="/kitchen/scanner"
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5 text-stone-300" />
            <span>QR Scanner</span>
          </Link>

          <button
            onClick={handleReportDelay}
            className="p-2 bg-white hover:bg-red-50 text-stone-500 hover:text-red-700 rounded-lg border border-stone-200/80 transition-colors"
            title="Broadcast kitchen rush delay to students"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-cream-100/80 p-0.5 rounded-lg border border-stone-200/60">
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterStatus === 'active'
                ? 'bg-white text-stone-900 shadow-soft'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Active Queue ({orders.filter((o) => ['placed', 'accepted', 'preparing'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setFilterStatus('ready')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filterStatus === 'ready'
                ? 'bg-white text-stone-900 shadow-soft'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Ready for Pickup
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-2.5 py-1.5 bg-cream-50 border border-stone-200/80 rounded-lg text-xs font-medium text-stone-700 focus:outline-none focus:border-stone-400"
          >
            <option value="all">All sessions</option>
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
        <div className="py-20 text-center text-xs text-stone-400 flex flex-col items-center gap-2.5">
          <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div>
          <span>Syncing orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-stone-200/80 p-8 space-y-1.5">
          <PackageCheck className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="font-medium text-sm text-stone-800">Kitchen queue is clear</p>
          <p className="text-xs text-stone-400">All pre-orders for this session have been prepared.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      <PrepSheetModal isOpen={isPrepSheetOpen} onClose={() => setIsPrepSheetOpen(false)} />

      {scannerModalToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
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
