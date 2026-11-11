import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';

// Common
import Navbar from './components/common/Navbar';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import DigitalMenuPage from './pages/student/DigitalMenuPage';
import CartPage from './pages/student/CartPage';
import OrdersPage from './pages/student/OrdersPage';
import OrderDetailPage from './pages/student/OrderDetailPage';
import WalletPage from './pages/student/WalletPage';
import MealPlansPage from './pages/student/MealPlansPage';
import MessCalendarPage from './pages/student/MessCalendarPage';
import GroupOrderPage from './pages/student/GroupOrderPage';
import ProfilePage from './pages/student/ProfilePage';

// Kitchen Pages
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import KitchenScannerPage from './pages/kitchen/KitchenScannerPage';
import ReadyOrdersBoard from './pages/kitchen/ReadyOrdersBoard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminSlotsPage from './pages/admin/AdminSlotsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminOffersPage from './pages/admin/AdminOffersPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'kitchen') return <Navigate to="/kitchen/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

// Root index redirect
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'kitchen') return <Navigate to="/kitchen/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col bg-cream-50">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  {/* Root and Auth */}
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Student Routes */}
                  <Route
                    path="/student/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/menu"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <DigitalMenuPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/cart"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/checkout"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <CartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/orders"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/orders/:id"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <OrderDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/wallet"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <WalletPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/meal-plans"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <MealPlansPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/calendar"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <MessCalendarPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/group-order"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <GroupOrderPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/profile"
                    element={
                      <ProtectedRoute allowedRoles={['student', 'admin', 'kitchen']}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Kitchen Staff Routes */}
                  <Route
                    path="/kitchen/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
                        <KitchenDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/kitchen/orders"
                    element={
                      <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
                        <KitchenDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/kitchen/scanner"
                    element={
                      <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
                        <KitchenScannerPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/kitchen/ready"
                    element={
                      <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
                        <ReadyOrdersBoard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/menu"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminMenuPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/orders"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminOrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/slots"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminSlotsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/inventory"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminInventoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminAnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/offers"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminOffersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/staff"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminStaffPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'rounded-2xl text-xs font-semibold shadow-xl border border-stone-100',
                duration: 4000,
              }}
            />
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
