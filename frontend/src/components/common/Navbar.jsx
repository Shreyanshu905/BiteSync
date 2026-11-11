import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  UtensilsCrossed,
  ShoppingBag,
  Wallet,
  Calendar,
  Users,
  Clock,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldAlert,
  ChefHat,
  Menu as MenuIcon,
  X,
  CreditCard,
  FileText,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout, isStudent, isAdmin, isKitchen } = useAuth();
  const { totalItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Compute current meal window
  const getCurrentMealWindow = () => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return { label: 'Breakfast Window', time: '7:30 - 10:30 AM', icon: '🌅' };
    if (hour >= 11 && hour < 16) return { label: 'Lunch Window', time: '12:00 - 3:00 PM', icon: '☀️' };
    if (hour >= 16 && hour < 19) return { label: 'Evening Snacks', time: '4:30 - 6:30 PM', icon: '☕' };
    if (hour >= 19 && hour < 22) return { label: 'Dinner Window', time: '7:30 - 10:00 PM', icon: '🌙' };
    return { label: 'Late Night Canteen', time: '10:30 PM - 1:00 AM', icon: '✨' };
  };

  const mealWindow = getCurrentMealWindow();

  const handleRoleSwitch = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'kitchen') navigate('/kitchen/dashboard');
    else navigate('/student/menu');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100/80 shadow-xs">
      {/* Top micro bar with active meal period & 1-click role switcher demo shortcut */}
      <div className="bg-stone-900 text-stone-300 px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-medium text-amber-300">
            <span>{mealWindow.icon}</span>
            <span>{mealWindow.label}</span>
          </span>
          <span className="hidden sm:inline text-stone-500">•</span>
          <span className="hidden sm:inline text-stone-400">{mealWindow.time}</span>
        </div>

        {/* Evaluator Quick Role Switcher */}
        {user && (
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-stone-400">View as:</span>
            <div className="flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
              <button
                onClick={() => handleRoleSwitch('student')}
                className={`px-2 py-0.5 rounded text-[11px] transition-all font-medium ${
                  location.pathname.startsWith('/student')
                    ? 'bg-brand-500 text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => handleRoleSwitch('kitchen')}
                className={`px-2 py-0.5 rounded text-[11px] transition-all font-medium ${
                  location.pathname.startsWith('/kitchen')
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Kitchen
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`px-2 py-0.5 rounded text-[11px] transition-all font-medium ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-purple-600 text-white'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'kitchen' ? '/kitchen/dashboard' : '/student/dashboard'} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-stone-900">Bite<span className="text-brand-500">Sync</span></span>
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Hostel</span>
            </div>
            <p className="text-[10px] text-stone-500 hidden sm:block -mt-1 font-medium">Skip Queue • Sync Meal</p>
          </div>
        </Link>

        {/* Student Navigation Links */}
        {isStudent && (
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/student/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/student/dashboard' ? 'text-brand-600 bg-brand-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/student/menu"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/student/menu' ? 'text-brand-600 bg-brand-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Canteen Menu
            </Link>
            <Link
              to="/student/orders"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.startsWith('/student/orders') ? 'text-brand-600 bg-brand-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              My Orders
            </Link>
            <Link
              to="/student/meal-plans"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/student/meal-plans' ? 'text-brand-600 bg-brand-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Meal Pass
            </Link>
            <Link
              to="/student/calendar"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/student/calendar' ? 'text-brand-600 bg-brand-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Mess Calendar
            </Link>
            <Link
              to="/student/group-order"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/student/group-order' ? 'text-brand-600 bg-brand-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              Group Order
            </Link>
          </nav>
        )}

        {/* Kitchen Navigation Links */}
        {isKitchen && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/kitchen/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/kitchen/dashboard' ? 'text-amber-700 bg-amber-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Live Queue
            </Link>
            <Link
              to="/kitchen/scanner"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/kitchen/scanner' ? 'text-amber-700 bg-amber-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              QR Scanner
            </Link>
            <Link
              to="/kitchen/ready"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/kitchen/ready' ? 'text-amber-700 bg-amber-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ready Orders Board
            </Link>
          </nav>
        )}

        {/* Admin Navigation Links */}
        {isAdmin && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/admin/dashboard"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/admin/dashboard' ? 'text-purple-700 bg-purple-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/admin/menu"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/admin/menu' ? 'text-purple-700 bg-purple-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Menu
            </Link>
            <Link
              to="/admin/orders"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/admin/orders' ? 'text-purple-700 bg-purple-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Orders
            </Link>
            <Link
              to="/admin/inventory"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/admin/inventory' ? 'text-purple-700 bg-purple-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Inventory
            </Link>
            <Link
              to="/admin/slots"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/admin/slots' ? 'text-purple-700 bg-purple-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pickup Slots
            </Link>
            <Link
              to="/admin/analytics"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/admin/analytics' ? 'text-purple-700 bg-purple-50' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Analytics & Waste
            </Link>
          </nav>
        )}

        {/* Right side Actions */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              {/* Student Wallet Pill */}
              {isStudent && (
                <Link
                  to="/student/wallet"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-stone-800 rounded-full border border-amber-200 transition-colors shadow-2xs"
                  title="View Wallet Balance & Topup"
                >
                  <Wallet className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-stone-900">₹{user.walletBalance || 0}</span>
                </Link>
              )}

              {/* Cart Button */}
              {isStudent && (
                <Link
                  to="/student/cart"
                  className="relative p-2 text-stone-700 hover:text-brand-600 hover:bg-stone-50 rounded-xl transition-colors"
                  title="Shopping Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs animate-bounce">
                      {totalItemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notification Bell */}
              <NotificationDropdown />

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand-500 to-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-900">{user.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-stone-100 text-stone-700">
                          {user.role}
                        </span>
                        {user.studentId && (
                          <span className="text-[11px] text-stone-500 font-mono">
                            {user.studentId}
                          </span>
                        )}
                      </div>
                    </div>

                    {isStudent && (
                      <>
                        <Link
                          to="/student/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-stone-400" />
                          Profile & Hostel
                        </Link>
                        <Link
                          to="/student/wallet"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          <CreditCard className="w-4 h-4 text-stone-400" />
                          Wallet & Top-up
                        </Link>
                        <Link
                          to="/student/orders"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          <FileText className="w-4 h-4 text-stone-400" />
                          Past Orders
                        </Link>
                      </>
                    )}

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-stone-900"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-xs transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-1">
          {isStudent && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Home
              </Link>
              <Link
                to="/student/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Canteen Menu
              </Link>
              <Link
                to="/student/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                My Orders
              </Link>
              <Link
                to="/student/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Cart ({totalItemCount})
              </Link>
              <Link
                to="/student/wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Student Wallet (₹{user?.walletBalance || 0})
              </Link>
              <Link
                to="/student/meal-plans"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Meal Subscription
              </Link>
              <Link
                to="/student/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Mess Calendar
              </Link>
              <Link
                to="/student/group-order"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Group Ordering
              </Link>
            </>
          )}

          {isKitchen && (
            <>
              <Link
                to="/kitchen/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Live Kitchen Queue
              </Link>
              <Link
                to="/kitchen/scanner"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                QR Scanner
              </Link>
              <Link
                to="/kitchen/ready"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Ready Orders Board
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Admin Overview
              </Link>
              <Link
                to="/admin/menu"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Menu Management
              </Link>
              <Link
                to="/admin/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Order Operations
              </Link>
              <Link
                to="/admin/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Inventory & Stock
              </Link>
              <Link
                to="/admin/slots"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Pickup Slots
              </Link>
              <Link
                to="/admin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-50"
              >
                Analytics & Waste Prediction
              </Link>
            </>
          )}

          {user && (
            <button
              onClick={logout}
              className="w-full mt-4 px-3 py-2 rounded-lg text-base font-medium text-red-600 bg-red-50 text-left"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
