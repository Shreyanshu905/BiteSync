import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  UtensilsCrossed,
  ShoppingBag,
  Wallet,
  LogOut,
  ChevronDown,
  LayoutDashboard,
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

  const getCurrentMealWindow = () => {
    const hour = new Date().getHours();
    if (hour >= 7 && hour < 11) return { label: 'Breakfast', time: '7:30 – 10:30 AM' };
    if (hour >= 11 && hour < 16) return { label: 'Lunch', time: '12:00 – 3:00 PM' };
    if (hour >= 16 && hour < 19) return { label: 'Snacks', time: '4:30 – 6:30 PM' };
    if (hour >= 19 && hour < 22) return { label: 'Dinner', time: '7:30 – 10:00 PM' };
    return { label: 'Late Night', time: '10:30 PM – 1:00 AM' };
  };

  const mealWindow = getCurrentMealWindow();

  const handleRoleSwitch = (role) => {
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'kitchen') navigate('/kitchen/dashboard');
    else navigate('/student/menu');
  };

  const navLinkClass = (active) =>
    `px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
      active
        ? 'text-stone-900 bg-stone-100'
        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/75">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand & Quiet Meal Period Indicator */}
        <div className="flex items-center gap-4">
          <Link
            to={
              user?.role === 'admin'
                ? '/admin/dashboard'
                : user?.role === 'kitchen'
                ? '/kitchen/dashboard'
                : '/student/dashboard'
            }
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-cream-50 transition-colors group-hover:bg-brand-600">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-[16px] font-semibold tracking-tight text-stone-900">
              Bite<span className="text-brand-500">Sync</span>
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-stone-500 bg-stone-100/75 border border-stone-200/60 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/80"></span>
            <span className="font-medium text-stone-700">{mealWindow.label}</span>
            <span className="text-stone-300">·</span>
            <span>{mealWindow.time}</span>
          </div>
        </div>

        {/* Center: Role Navigation Links */}
        {isStudent && (
          <nav className="hidden lg:flex items-center gap-0.5">
            <Link to="/student/dashboard" className={navLinkClass(location.pathname === '/student/dashboard')}>
              Home
            </Link>
            <Link to="/student/menu" className={navLinkClass(location.pathname === '/student/menu')}>
              Menu
            </Link>
            <Link to="/student/orders" className={navLinkClass(location.pathname.startsWith('/student/orders'))}>
              Orders
            </Link>
            <Link to="/student/calendar" className={navLinkClass(location.pathname === '/student/calendar')}>
              Calendar
            </Link>
            <Link to="/student/group-order" className={navLinkClass(location.pathname === '/student/group-order')}>
              Group Order
            </Link>
          </nav>
        )}

        {isKitchen && (
          <nav className="hidden md:flex items-center gap-0.5">
            <Link to="/kitchen/dashboard" className={navLinkClass(location.pathname === '/kitchen/dashboard')}>
              Queue
            </Link>
            <Link to="/kitchen/scanner" className={navLinkClass(location.pathname === '/kitchen/scanner')}>
              QR Scanner
            </Link>
            <Link to="/kitchen/ready" className={navLinkClass(location.pathname === '/kitchen/ready')}>
              Ready Board
            </Link>
          </nav>
        )}

        {isAdmin && (
          <nav className="hidden md:flex items-center gap-0.5">
            <Link to="/admin/dashboard" className={navLinkClass(location.pathname === '/admin/dashboard')}>
              Overview
            </Link>
            <Link to="/admin/menu" className={navLinkClass(location.pathname === '/admin/menu')}>
              Menu
            </Link>
            <Link to="/admin/orders" className={navLinkClass(location.pathname === '/admin/orders')}>
              Orders
            </Link>
            <Link to="/admin/inventory" className={navLinkClass(location.pathname === '/admin/inventory')}>
              Inventory
            </Link>
            <Link to="/admin/slots" className={navLinkClass(location.pathname === '/admin/slots')}>
              Slots
            </Link>
            <Link to="/admin/analytics" className={navLinkClass(location.pathname === '/admin/analytics')}>
              Analytics
            </Link>
          </nav>
        )}

        {/* Right: Utility Controls */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Subtle Role Switcher for Demo Evaluation */}
              <div className="hidden sm:flex items-center bg-stone-100/80 rounded-lg p-0.5 border border-stone-200/70 mr-1">
                {['student', 'kitchen', 'admin'].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium capitalize transition-colors ${
                      location.pathname.startsWith(`/${r}`)
                        ? 'bg-white text-stone-900 shadow-soft'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Student Wallet Pill */}
              {isStudent && (
                <Link
                  to="/student/wallet"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-lg border border-stone-200/80 transition-colors"
                  title="Wallet Balance"
                >
                  <Wallet className="w-3.5 h-3.5 text-stone-500" />
                  <span className="text-xs font-medium text-stone-800 tabular-nums">
                    ₹{user.walletBalance || 0}
                  </span>
                </Link>
              )}

              {/* Cart Button */}
              {isStudent && (
                <Link
                  to="/student/cart"
                  className="relative p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Order Bag"
                >
                  <ShoppingBag className="w-[18px] h-[18px]" />
                  {totalItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-brand-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                      {totalItemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Notification Bell */}
              <NotificationDropdown />

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-stone-200/80 text-stone-800 font-medium text-xs flex items-center justify-center border border-stone-300/60">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-stone-200/80 py-1.5 z-50"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-stone-100">
                      <p className="text-sm font-medium text-stone-900">{user.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded bg-stone-100 text-stone-600">
                          {user.role}
                        </span>
                        {user.studentId && (
                          <span className="text-[11px] text-stone-400 font-mono">
                            {user.studentId}
                          </span>
                        )}
                      </div>
                    </div>

                    {isStudent && (
                      <div className="py-1">
                        <Link
                          to="/student/profile"
                          className="flex items-center gap-2.5 px-3.5 py-1.5 text-[13px] text-stone-700 hover:bg-stone-50"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-stone-400" />
                          Profile & Hostel
                        </Link>
                        <Link
                          to="/student/wallet"
                          className="flex items-center gap-2.5 px-3.5 py-1.5 text-[13px] text-stone-700 hover:bg-stone-50"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-stone-400" />
                          Wallet & Top-up
                        </Link>
                        <Link
                          to="/student/orders"
                          className="flex items-center gap-2.5 px-3.5 py-1.5 text-[13px] text-stone-700 hover:bg-stone-50"
                        >
                          <FileText className="w-3.5 h-3.5 text-stone-400" />
                          Past Orders
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-1.5 text-[13px] text-stone-600 hover:text-red-600 hover:bg-stone-50 text-left transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
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
                className="px-3 py-1.5 text-[13px] font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-[13px] font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-stone-500 hover:text-stone-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-5 space-y-0.5">
          {isStudent && (
            <>
              {[
                { to: '/student/dashboard', label: 'Home' },
                { to: '/student/menu', label: 'Menu' },
                { to: '/student/orders', label: 'Orders' },
                { to: '/student/cart', label: `Cart (${totalItemCount})` },
                { to: '/student/wallet', label: `Wallet (₹${user?.walletBalance || 0})` },
                { to: '/student/calendar', label: 'Mess Calendar' },
                { to: '/student/group-order', label: 'Group Order' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}

          {isKitchen && (
            <>
              {[
                { to: '/kitchen/dashboard', label: 'Live Queue' },
                { to: '/kitchen/scanner', label: 'QR Scanner' },
                { to: '/kitchen/ready', label: 'Ready Board' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}

          {isAdmin && (
            <>
              {[
                { to: '/admin/dashboard', label: 'Overview' },
                { to: '/admin/menu', label: 'Menu Management' },
                { to: '/admin/orders', label: 'Orders' },
                { to: '/admin/inventory', label: 'Inventory' },
                { to: '/admin/slots', label: 'Pickup Slots' },
                { to: '/admin/analytics', label: 'Analytics & Waste' },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  {item.label}
                </Link>
              ))}
            </>
          )}

          {user && (
            <button
              onClick={logout}
              className="w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:text-red-600 hover:bg-stone-50 text-left"
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
