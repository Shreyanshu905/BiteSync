import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bitesync_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bitesync_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('bitesync_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to fetch user session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('bitesync_token', res.data.token);
        localStorage.setItem('bitesync_user', JSON.stringify(res.data.user));
        toast.success(`Welcome back, ${res.data.user.name}! 🍱`);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('bitesync_token', res.data.token);
        localStorage.setItem('bitesync_user', JSON.stringify(res.data.user));
        toast.success('🎉 Account registered! ₹500 welcome credit added to your wallet!');
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bitesync_token');
    localStorage.removeItem('bitesync_user');
    toast.success('Logged out successfully.');
  };

  const updateWalletBalance = (newBalance) => {
    if (user) {
      const updated = { ...user, walletBalance: newBalance };
      setUser(updated);
      localStorage.setItem('bitesync_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        fetchCurrentUser,
        updateWalletBalance,
        isAuthenticated: !!user,
        isStudent: user?.role === 'student',
        isAdmin: user?.role === 'admin',
        isKitchen: user?.role === 'kitchen',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

