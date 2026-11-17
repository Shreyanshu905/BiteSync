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
} from 'lucide-react';

const AdminSidebar = () => {
  const links = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/menu', icon: UtensilsCrossed, label: 'Menu Catalog' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'All Orders' },
    { to: '/admin/slots', icon: Clock, label: 'Pickup Slots' },
    { to: '/admin/inventory', icon: Package, label: 'Inventory' },
    { to: '/admin/analytics', icon: TrendingUp, label: 'Analytics & Waste' },
    { to: '/admin/offers', icon: Tag, label: 'Offers & Notices' },
    { to: '/admin/staff', icon: Users, label: 'Staff' },
  ];

  return (
    <aside className="w-56 bg-white/60 border-r border-stone-200/75 min-h-[calc(100vh-56px)] p-3.5 shrink-0 hidden md:block">
      <div className="space-y-0.5">
        <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-stone-400 mb-2">
          Operations
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-stone-400" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default AdminSidebar;
