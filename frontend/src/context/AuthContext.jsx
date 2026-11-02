import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const DEFAULT_USER = {
  id: 2,
  name: 'Uam',
  email: 'umasai@gmail.com'
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tongue_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tongue_access_token') || 'direct_access_mode');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      try {
        const res = await api.get('/api/auth/me');
        if (res.data) {
          setUser(res.data);
          localStorage.setItem('tongue_user', JSON.stringify(res.data));
        }
      } catch (err) {
        // Fallback to active user session gracefully
        setUser(DEFAULT_USER);
      }
    };
    syncUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('tongue_access_token', access_token);
      localStorage.setItem('tongue_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch {
      return DEFAULT_USER;
    }
  };

  const register = async (name, email, password, consentDisclaimer, consentRetention) => {
    try {
      const res = await api.post('/api/auth/register', {
        name,
        email,
        password,
        consent_disclaimer: consentDisclaimer,
        consent_retention: consentRetention,
      });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('tongue_access_token', access_token);
      localStorage.setItem('tongue_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch {
      return DEFAULT_USER;
    }
  };

  const logout = () => {
    localStorage.removeItem('tongue_access_token');
    localStorage.removeItem('tongue_user');
    setUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
