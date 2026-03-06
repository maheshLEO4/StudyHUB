import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
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
  const [mobileOpen, setMobileOpen] = useState(false);


  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className={`app-layout ${mobileOpen ? 'app-layout--mobile-open' : ''}`}>
      {/* Mobile Overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>

        <div className="sidebar__header">
          <div className="logo">
            <div className="logo__icon"><Icon name="book" size={18} /></div>
            {!collapsed && <span className="logo__text">StudyHub</span>}
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Icon name={icon} size={18} />
              {(!collapsed || mobileOpen) && <span>{label}</span>}
            </NavLink>

          ))}
        </nav>

        <div className="sidebar__footer">
          <button className="nav-item nav-item--danger" onClick={handleLogout} style={{ borderTop: 'none', padding: '10px 14px' }}>
            <Icon name="logout" size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>
          {!collapsed && <div className="version-footer">StudyHub v1.0</div>}
        </div>
      </aside>

      {/* Main content */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <button className="topbar__menu-btn topbar__menu-btn--desktop" onClick={() => setCollapsed((c) => !c)}>
            <Icon name="menu" size={20} />
          </button>
          <button className="topbar__menu-btn topbar__menu-btn--mobile" onClick={() => setMobileOpen(true)}>
            <Icon name="menu" size={20} />
          </button>

          <div className="topbar__spacer" />
          <div className="flex gap-2">
            <button className="topbar__icon-btn" onClick={() => navigate('/search')} title="Search">
              <Icon name="search" size={16} />
            </button>
            <button className="topbar__icon-btn" onClick={toggle} title="Toggle theme">
              <Icon name={!dark ? 'moon' : 'sun'} size={16} />
            </button>
            <button className="topbar__icon-btn" onClick={() => navigate('/settings')} title="Settings">
              <Icon name="settings" size={16} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content" style={{ overflowY: 'auto' }}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
