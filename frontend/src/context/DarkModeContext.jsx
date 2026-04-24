import { createContext, useState, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const DarkModeContext = createContext({ darkMode: false, toggleDarkMode: () => {} });

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('scrapbridge_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return false; // Default to light if not set
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('scrapbridge_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('scrapbridge_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}
