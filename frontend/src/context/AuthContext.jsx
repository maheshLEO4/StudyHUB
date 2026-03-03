/**
 * Auth Context
 * Provides authentication state throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState('light');

  // Load user from storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('studyhub_user');
    const storedToken = localStorage.getItem('studyhub_token');
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setThemeState(parsedUser.theme || 'light');
    }
    setLoading(false);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('studyhub_token', data.token);
    localStorage.setItem('studyhub_user', JSON.stringify(data.user));
    setUser(data.user);
    setThemeState(data.user.theme || 'light');
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('studyhub_token', data.token);
    localStorage.setItem('studyhub_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('studyhub_token');
    localStorage.removeItem('studyhub_user');
    setUser(null);
  }, []);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    const updatedUser = { ...user, theme: newTheme };
    setUser(updatedUser);
    localStorage.setItem('studyhub_user', JSON.stringify(updatedUser));
    try {
      await api.patch('/auth/theme', { theme: newTheme });
    } catch (e) {
      // Fail silently - theme preference saved locally
    }
  }, [theme, user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
