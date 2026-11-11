import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useSocket } from '../../context/SocketContext';
import { PackageCheck, Clock, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReadyOrdersBoard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchReadyOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchReadyOrders();
    };

    socket.on('order_status_updated', handleUpdate);
    socket.on('order_collected', handleUpdate);
    return () => {
      socket.off('order_status_updated', handleUpdate);
      socket.off('order_collected', handleUpdate);
    };
  }, [socket]);

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/kitchen/ready');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-stone-900 text-white p-6 sm:p-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Live Pickup Counter Board
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Orders Ready for Pickup 🍱
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Students whose tokens appear below may proceed to the counter with their QR pass.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/kitchen/scanner"
            className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Open QR Scanner
          </Link>
          <Link
            to="/kitchen/dashboard"
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-colors"
          >
            Kitchen Queue
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-stone-500">Updating token board...</div>
      ) : orders.length === 0 ? (
        <div className="py-28 text-center bg-stone-800/50 rounded-3xl border border-stone-800 p-8 space-y-3">
          <PackageCheck className="w-16 h-16 text-stone-600 mx-auto" />
          <h3 className="text-xl font-bold text-stone-300">No Orders Awaiting Collection</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Freshly prepared orders will appear here immediately as the kitchen marks them ready.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-stone-800/90 border-2 border-emerald-500/80 rounded-3xl p-5 text-center shadow-lg hover:border-emerald-400 transition-all space-y-3"
            >
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Ready at Counter
              </span>

              <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white">
                {order.pickupToken}
              </div>

              <div className="pt-2 border-t border-stone-700/80 text-xs text-stone-400 space-y-1">
                <p className="font-semibold text-stone-200 truncate">
                  {order.student?.name}
                </p>
                <p className="text-[11px] text-stone-400">
                  #{order.orderNumber}
                </p>
                <p className="text-[10px] text-amber-400 font-mono">
                  Slot: {order.slotDisplay?.startTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadyOrdersBoard;

