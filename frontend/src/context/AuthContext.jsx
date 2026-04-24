import { createContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/auth.api';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('scrapbridge_token'));
  // Only show loading initially if we actually have a token to verify
  const [loading, setLoading] = useState(() => !!localStorage.getItem('scrapbridge_token'));

  // On mount: restore session from localStorage token
  useEffect(() => {
    if (token) {
      getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          // Token is invalid/expired — clean up
          localStorage.removeItem('scrapbridge_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  /**
   * Called after a successful login response.
   * @param {string} jwtToken
   * @param {object} userData
   */
  const login = useCallback((jwtToken, userData) => {
    localStorage.setItem('scrapbridge_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  }, []);

  /**
   * Clears auth state and removes token from storage.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('scrapbridge_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
