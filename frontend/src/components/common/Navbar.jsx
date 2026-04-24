import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-30 transition-colors duration-200">
      {/* Left: user identity */}
      <div>
        <p className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-2">
          {user?.name}
          {user?.role && (
            <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">
              {user.role.replace('_', ' ')}
            </span>
          )}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs">{user?.email}</p>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <DarkModeToggle />
        <NotificationBell />
        <div className="w-px h-5 bg-gray-700 mx-2" />
        <button
          id="navbar-logout"
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
