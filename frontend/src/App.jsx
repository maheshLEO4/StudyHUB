import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/shared/Layout';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/dashboard/Dashboard';
import SubjectsPage from './components/subjects/SubjectsPage';
import LinksPage from './components/links/LinksPage';
import DSAPage from './components/dsa/DSAPage';
import CalendarPage from './components/calendar/CalendarPage';
import TodosPage from './components/todos/TodosPage';
import SearchPage from './components/search/SearchPage';
import SettingsPage from './components/settings/SettingsPage';
import HabitsPage from './pages/HabitsPage';
import Spinner from './components/shared/Spinner';
import './styles/components.css';

// Route guard
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <Spinner size={36} />
    </div>
  );
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<AuthPage />} />
    <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
    <Route path="/subjects" element={<PrivateRoute><SubjectsPage /></PrivateRoute>} />
    <Route path="/links" element={<PrivateRoute><LinksPage /></PrivateRoute>} />
    <Route path="/dsa" element={<PrivateRoute><DSAPage /></PrivateRoute>} />
    <Route path="/calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
    <Route path="/todos" element={<PrivateRoute><TodosPage /></PrivateRoute>} />
    <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
    <Route path="/habits" element={<PrivateRoute><HabitsPage /></PrivateRoute>} />
    <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                fontFamily: "'Sora', sans-serif",
                fontSize: '13.5px',
                borderRadius: '10px',
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-lg)',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
