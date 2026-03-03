// ============================================================
// Layout.js — Global App Shell
// ============================================================
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Link2, Code2, Calendar,
  CheckSquare, Search, Sun, Moon, LogOut, Menu, X, GraduationCap, Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/subjects', label: 'Subjects', Icon: BookOpen },
  { to: '/links', label: 'Links', Icon: Link2 },
  { to: '/dsa', label: 'DSA Tracker', Icon: Code2 },
  { to: '/calendar', label: 'Calendar', Icon: Calendar },
  { to: '/habits', label: 'Daily Habits', Icon: Flame },
  { to: '/tasks', label: 'Tasks', Icon: CheckSquare },
];

function SidebarContent({ user, onLogout, onClose }) {
  return (
    <>
      <div className="sidebar-logo">
        <div className="logo-wrap">
          <div className="logo-icon"><GraduationCap size={20} /></div>
          <span className="logo-text">StudyHub</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-group">
          <div className="nav-group-label">Navigation</div>
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to} to={to} end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name truncate">{user?.name}</div>
            <div className="user-email truncate">{user?.email}</div>
          </div>
        </div>
        <button className="nav-item" onClick={onLogout} style={{ color: 'var(--danger)' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </>
  );
}

function Layout({ children, currentPage }) {
  const { user, logout } = useAuth();
  const { dark, toggle: toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <SidebarContent user={user} onLogout={handleLogout} onClose={() => { }} />
      </aside>

      {/* Mobile sidebar + overlay */}
      {sidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
          <aside className="sidebar open">
            <SidebarContent user={user} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn btn-ghost btn-icon hamburger" onClick={() => setSidebarOpen(o => !o)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="topbar-title">{currentPage}</span>
          </div>
          <div className="flex gap-2 items-center">
            <button className="btn btn-ghost btn-icon" onClick={() => navigate('/search')}><Search size={16} /></button>
            <button className="btn btn-ghost btn-icon" onClick={toggleTheme}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
