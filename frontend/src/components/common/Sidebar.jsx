import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ROLE_LABELS = {
  ADMIN: 'Admin',
  HOME_USER: 'Home User',
  COLLECTOR: 'Collector',
  BUYER: 'Buyer',
};

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const roleLabel = ROLE_LABELS[user?.role] ?? user?.role ?? 'User';

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-40">
      {/* Brand */}
      <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-800">
        <div className="w-7 h-7 rounded-md bg-green-600 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <span className="font-bold text-white text-sm tracking-tight">ScrapBridge</span>
      </div>

      {/* Role badge */}
      <div className="px-5 py-4 border-b border-gray-800">
        <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">{roleLabel} Panel</span>
      </div>

      {/* Nav placeholder */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 py-2 rounded-lg bg-green-600/10 border border-green-700/30">
          <span className="text-green-400 text-sm font-medium">Dashboard</span>
        </div>
        <p className="px-3 py-2 text-xs text-gray-600">More navigation in Phase 2…</p>
      </nav>

      {/* User info */}
      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        <p className="text-sm text-white font-medium truncate">{user?.name}</p>
      </div>
    </aside>
  );
}
