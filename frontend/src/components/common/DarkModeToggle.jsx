import { useContext } from 'react';
import { Moon, Sun } from 'lucide-react';
import { DarkModeContext } from '../../context/DarkModeContext';

/**
 * DarkModeToggle — Moon/Sun button that calls toggleDarkMode() from context.
 */
export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <button
      id="dark-mode-toggle-btn"
      onClick={toggleDarkMode}
      className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
