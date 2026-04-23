import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import api from '../../api/axios';
import { getRelativeTime } from '../../utils/formatters';

/**
 * NotificationBell — fetches /api/notifications/my and shows a dropdown.
 */
export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch on mount
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.get('/notifications/my');
        setNotifications(res.data.notifications ?? []);
      } catch {
        // silently fail — user may not be logged in yet
      }
    }
    loadNotifications();
  }, []);

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-green-600 dark:text-green-400 hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">
                No notifications yet.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 flex flex-col gap-0.5 ${
                    !n.read
                      ? 'border-l-2 border-green-500 bg-green-50 dark:bg-green-900/10'
                      : ''
                  }`}
                >
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                    {n.message}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {getRelativeTime(n.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
