import React, { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import api from '../../api/client';
import { useSocket } from '../../context/SocketContext';

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchNotifications();
    };

    socket.on('order_status_updated', handleUpdate);
    socket.on('order_placed', handleUpdate);
    socket.on('order_collected', handleUpdate);

    return () => {
      socket.off('order_status_updated', handleUpdate);
      socket.off('order_placed', handleUpdate);
      socket.off('order_collected', handleUpdate);
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-stone-700 hover:text-brand-600 hover:bg-stone-50 rounded-xl transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute 1 top-1 right-1 w-2.5 h-2.5 bg-brand-500 rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 pb-2 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-semibold text-stone-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-50">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-stone-400">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 hover:bg-stone-50 transition-colors ${
                    !n.isRead ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-stone-900">{n.title}</p>
                    <span className="text-[10px] text-stone-400 shrink-0">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;

