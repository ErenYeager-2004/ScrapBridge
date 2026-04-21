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
    <header className="fixed top-0 left-64 right-0 h-16 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-6 z-30">
      {/* Left: user identity */}
      <div>
        <p className="text-white font-semibold text-sm">{user?.name}</p>
        <p className="text-gray-500 text-xs">{user?.email}</p>
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
