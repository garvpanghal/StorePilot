import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('storepilot-token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const u = await authAPI.me();
      setUser(u);
    } catch {
      localStorage.removeItem('storepilot-token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('storepilot-token', data.access_token);
    const u = await authAPI.me();
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('storepilot-token');
    setUser(null);
  };

  const updateOnboardingState = (completed) => {
    setUser(prev => prev ? { ...prev, onboarding_completed: completed } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth, updateOnboardingState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
