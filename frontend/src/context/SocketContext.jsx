import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to BiteSync Real-time Gateway:', socketInstance.id);
      setConnected(true);

      // Join room based on user role
      if (user) {
        if (user.role === 'admin') {
          socketInstance.emit('join_room', 'admin');
        } else if (user.role === 'kitchen') {
          socketInstance.emit('join_room', 'kitchen');
        } else if (user.role === 'student') {
          socketInstance.emit('join_room', `student_${user.id}`);
        }
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from Real-time Gateway');
      setConnected(false);
    });

    // Student real-time order tracking
    socketInstance.on('order_status_updated', (data) => {
      toast(data.message || 'Order status updated!', {
        icon: '🔔',
        duration: 5000,
      });
    });

    // Kitchen live order alert
    socketInstance.on('order_placed', (data) => {
      toast.success(data.message || `New Order #${data.order?.orderNumber} received!`, {
        icon: '👨‍🍳',
        duration: 6000,
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

