/**
 * AuthContext — provides user state & auth actions to entire app
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    authAPI.getMe()
      .then(({ data }) => setUser(data.data))
      .catch(() => localStorage.removeItem('accessToken'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    localStorage.setItem('accessToken', data.data.token);
    setUser(data.data.user);
    toast.success(`Welcome back, ${data.data.user.name}!`);
    return data.data.user;
  }, []);

  const signup = useCallback(async (form) => {
    const { data } = await authAPI.signup(form);
    localStorage.setItem('accessToken', data.data.token);
    setUser(data.data.user);
    toast.success('Account created! Welcome to StudyHub 🎉');
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { }
    localStorage.removeItem('accessToken');
    setUser(null);
    toast.success('Logged out');
  }, []);

  const updateUser = useCallback((updatedUser) => setUser(updatedUser), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
