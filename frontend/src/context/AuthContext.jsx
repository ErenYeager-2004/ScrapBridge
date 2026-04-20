import { createContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/auth.api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage token
  useEffect(() => {
    const storedToken = localStorage.getItem('scrapbridge_token');
    if (storedToken) {
      setToken(storedToken);
      getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          // Token is invalid/expired — clean up
          localStorage.removeItem('scrapbridge_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
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
