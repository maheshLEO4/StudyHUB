import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Icon from './Icon';

const NAV_ITEMS = [
  { to: '/', icon: 'dashboard', label: 'Dashboard' },
  { to: '/subjects', icon: 'book', label: 'Subjects' },
  { to: '/links', icon: 'link', label: 'Links' },
  { to: '/dsa', icon: 'code', label: 'DSA Tracker' },
  { to: '/calendar', icon: 'calendar', label: 'Calendar' },
  { to: '/habits', icon: 'fire', label: 'Daily Tasks' },
  { to: '/todos', icon: 'checklist', label: 'Tasks' },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
        <div className="sidebar__header">
          <div className="logo">
            <div className="logo__icon"><Icon name="book" size={20} /></div>
            {!collapsed && <span className="logo__text">StudyHub</span>}
          </div>
        </div>

        <nav className="sidebar__nav">
          <div className="nav-section">
            {!collapsed && <div className="nav-label">Menu</div>}
            {NAV_ITEMS.map(({ to, icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}>
                <Icon name={icon} size={17} />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar__footer">
          {!collapsed && (
            <div className="user-card">
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-email">{user?.email}</div>
              </div>
            </div>
          )}
          <button className="nav-item nav-item--danger" onClick={handleLogout}>
            <Icon name="logout" size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <button className="topbar__menu-btn" onClick={() => setCollapsed((c) => !c)}>
            <Icon name="menu" size={20} />
          </button>
          <div className="topbar__spacer" />
          <button className="topbar__icon-btn" onClick={() => navigate('/search')} title="Search">
            <Icon name="search" size={17} />
          </button>
          <button className="topbar__icon-btn" onClick={toggle} title="Toggle theme">
            <Icon name={!dark ? 'moon' : 'sun'} size={17} />
          </button>
          <button className="topbar__icon-btn" onClick={() => navigate('/settings')} title="Settings">
            <Icon name="settings" size={17} />
          </button>
        </header>

        {/* Page content */}
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
