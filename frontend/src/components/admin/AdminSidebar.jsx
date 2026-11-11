import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  Package,
  TrendingUp,
  Tag,
  Users,
  AlertTriangle,
} from 'lucide-react';

const AdminSidebar = () => {
  const links = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menu Catalog' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'All Orders' },
    { to: '/admin/slots', icon: Clock, label: 'Pickup Slots' },
    { to: '/admin/inventory', icon: Package, label: 'Inventory & Stock' },
    { to: '/admin/analytics', icon: TrendingUp, label: 'Analytics & Waste' },
    { to: '/admin/offers', icon: Tag, label: 'Offers & Notices' },
    { to: '/admin/staff', icon: Users, label: 'Staff Management' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200/80 min-h-[calc(100vh-68px)] p-4 shrink-0 hidden md:block">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
          Canteen Operations
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default AdminSidebar;
