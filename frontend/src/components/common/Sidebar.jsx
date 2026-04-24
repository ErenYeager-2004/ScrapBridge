import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Recycle,
  LayoutDashboard,
  ClipboardList,
  Package,
  ShoppingCart,
  Star,
  Download,
  Plus,
  MapPin,
  CheckSquare,
  Search,
  Users,
} from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const ROLE_LABELS = {
  ADMIN:     'Admin',
  HOME_USER: 'Home User',
  COLLECTOR: 'Collector',
  BUYER:     'Buyer',
};

const NAV_LINKS = {
  ADMIN: [
    { to: '/admin',            label: 'Home',          Icon: LayoutDashboard, end: true },
    { to: '/admin/requests',   label: 'All Requests',  Icon: ClipboardList },
    { to: '/admin/inventory',  label: 'Inventory',     Icon: Package },
    { to: '/admin/orders',     label: 'Orders',        Icon: ShoppingCart },
    { to: '/admin/feedback',   label: 'Feedback',      Icon: Star },
    { to: '/admin/users',      label: 'Manage Users',  Icon: Users },
    { to: '/admin/export',     label: 'Export',        Icon: Download },
  ],
  HOME_USER: [
    { to: '/user',             label: 'Dashboard',     Icon: LayoutDashboard, end: true },
    { to: '/user/new-request', label: 'New Request',   Icon: Plus },
    { to: '/user/requests',    label: 'My Requests',   Icon: ClipboardList },
  ],
  COLLECTOR: [
    { to: '/collector',          label: 'Dashboard',    Icon: LayoutDashboard, end: true },
    { to: '/collector/pickups',  label: 'Assigned Pickups', Icon: MapPin },
    { to: '/collector/history',  label: 'History',      Icon: CheckSquare },
  ],
  BUYER: [
    { to: '/buyer',              label: 'Dashboard',    Icon: LayoutDashboard, end: true },
    { to: '/buyer/inventory',    label: 'Browse Inventory', Icon: Search },
    { to: '/buyer/orders',       label: 'My Orders',    Icon: ShoppingCart },
  ],
};

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const roleLabel = ROLE_LABELS[user?.role] ?? user?.role ?? 'User';
  const links = NAV_LINKS[user?.role] ?? [];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
          <Recycle size={18} className="text-white" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sm tracking-tight">ScrapBridge</span>
          <span className="text-[10px] text-green-400 font-semibold uppercase tracking-widest">
            {roleLabel} Panel
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1A7A4A] text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info footer */}
      <div className="px-5 py-4 border-t border-gray-800 shrink-0">
        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        <p className="text-sm text-white font-medium truncate mt-0.5">{user?.name}</p>
      </div>
    </aside>
  );
}
