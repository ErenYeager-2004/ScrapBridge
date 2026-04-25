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
  BookOpen,
  Settings,
  HelpCircle,
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
    { to: '/admin/dashboard',            label: 'Home',          Icon: LayoutDashboard, end: true },
    { to: '/admin/requests',   label: 'All Requests',  Icon: ClipboardList },
    { to: '/admin/inventory',  label: 'Inventory',     Icon: Package },
    { to: '/admin/orders',     label: 'Orders',        Icon: ShoppingCart },
    { to: '/admin/feedback',   label: 'Feedback',      Icon: Star },
    { to: '/admin/users',      label: 'Manage Users',  Icon: Users },
    { to: '/admin/ledger',     label: 'Ledger',        Icon: BookOpen },
    { to: '/admin/export',     label: 'Export',        Icon: Download },
  ],
  HOME_USER: [
    { to: '/user/dashboard',             label: 'Dashboard',     Icon: LayoutDashboard, end: true },
    { to: '/user/requests',    label: 'My Requests',   Icon: ClipboardList },
  ],
  COLLECTOR: [
    { to: '/collector/dashboard',          label: 'Dashboard',    Icon: LayoutDashboard, end: true },
    { to: '/collector/pickups',  label: 'Assigned Pickups', Icon: MapPin },
    { to: '/collector/history',  label: 'History',      Icon: CheckSquare },
  ],
  BUYER: [
    { to: '/buyer/dashboard',              label: 'Dashboard',    Icon: LayoutDashboard, end: true },
    { to: '/buyer/inventory',    label: 'Browse Inventory', Icon: Search },
    { to: '/buyer/orders',       label: 'My Orders',    Icon: ShoppingCart },
  ],
};

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const roleLabel = ROLE_LABELS[user?.role] ?? user?.role ?? 'User';
  const links = NAV_LINKS[user?.role] ?? [];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-[#F8F9FA] dark:bg-gray-900 text-slate-800 dark:text-gray-100 flex flex-col z-40 border-r border-gray-200 dark:border-gray-800 transition-colors">
      {/* Logo */}
      <div className="h-20 flex items-center gap-3 px-6 shrink-0 mt-2">
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
             <span className="font-extrabold text-xl tracking-tight text-[#1A7A4A] dark:text-green-400">ScrapBridge</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-gray-400 font-medium tracking-wide">
            v2.0 System
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-1.5">
        {links.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-[#E8F3EC] dark:bg-[#1A7A4A] text-[#1A7A4A] dark:text-white'
                  : 'text-slate-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Prominent Action Button & Footer Settings */}
      <div className="px-4 pb-6 shrink-0 flex flex-col gap-2">
        {user?.role === 'HOME_USER' && (
          <NavLink 
            to="/user/new-request"
            className="flex items-center justify-center gap-2 w-full bg-[#1A7A4A] hover:bg-green-800 text-white px-4 py-3 rounded-full text-sm font-semibold transition-colors mb-4 shadow-sm"
          >
            <Plus size={18} />
            New Request
          </NavLink>
        )}
        {user?.role === 'BUYER' && (
          <NavLink 
            to="/buyer/inventory"
            className="flex items-center justify-center gap-2 w-full bg-[#1A7A4A] hover:bg-green-800 text-white px-4 py-3 rounded-full text-sm font-semibold transition-colors mb-4 shadow-sm"
          >
            <Plus size={18} />
            Browse Inventory
          </NavLink>
        )}
        
        {/* Settings & Support placeholders */}
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold text-slate-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-100 transition-colors w-full text-left">
          <Settings size={18} strokeWidth={2} />
          Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold text-slate-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-slate-900 dark:hover:text-gray-100 transition-colors w-full text-left">
          <HelpCircle size={18} strokeWidth={2} />
          Support
        </button>
        
        {/* User info footer */}
        <div className="mt-4 px-2 flex flex-col">
          <p className="text-xs text-slate-500 dark:text-gray-400 truncate">{user?.email}</p>
          <p className="text-sm text-slate-800 dark:text-gray-100 font-semibold truncate">{user?.name}</p>
          <p className="text-[10px] text-[#1A7A4A] font-bold uppercase tracking-wider mt-0.5">{roleLabel}</p>
        </div>
      </div>
    </aside>
  );
}
