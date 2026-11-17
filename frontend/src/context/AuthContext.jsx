import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => api.getToken());
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth expired events from API client
    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    api.setToken(newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (fullName, email, password, role) => {
    const res = await api.post('/auth/register', {
      full_name: fullName,
      email,
      password,
      role
    });
    const { token: newToken, user: userData } = res.data;
    api.setToken(newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const demoLogin = async () => {
    const res = await api.post('/auth/demo');
    const { token: newToken, user: userData } = res.data;
    api.setToken(newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        demoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
