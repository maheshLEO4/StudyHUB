// ============================================================
// Authentication Context
// ============================================================
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => { try { return JSON.parse(localStorage.getItem('studyhub_user')); } catch { return null; } });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const login = async (email, password) => {
    setLoading(true); setError('');
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('studyhub_token', data.data.token);
      localStorage.setItem('studyhub_user',  JSON.stringify(data.data.user));
      setUser(data.data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg); return { success: false, message: msg };
    } finally { setLoading(false); }
  };

  const register = async (name, email, password) => {
    setLoading(true); setError('');
    try {
      const { data } = await authAPI.register({ name, email, password });
      localStorage.setItem('studyhub_token', data.data.token);
      localStorage.setItem('studyhub_user',  JSON.stringify(data.data.user));
      setUser(data.data.user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg); return { success: false, message: msg };
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('studyhub_token');
    localStorage.removeItem('studyhub_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('studyhub_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
