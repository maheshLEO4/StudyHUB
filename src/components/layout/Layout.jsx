export default Layout
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Link2, Code2, Calendar,
  CheckSquare, Search, Moon, Sun, Menu, X, ClipboardList,
} from 'lucide-react'

import { useAuth } from '@/lib/auth.jsx'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui'
import styles from '@/styles/Layout.module.css'

const NAV = [
  { label: 'Dashboard',   to: '/dashboard', Icon: LayoutDashboard },
  { label: 'Subjects',    to: '/subjects',  Icon: BookOpen },
  { label: 'Tasks',       to: '/tasks',     Icon: CheckSquare },
  { label: 'Daily Tasks', to: '/daily',     Icon: ClipboardList },
  { label: 'DSA Tracker', to: '/dsa',       Icon: Code2 },
  { label: 'Calendar',    to: '/calendar',  Icon: Calendar },
  { label: 'Links',       to: '/links',     Icon: Link2 },
]

function Layout({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('sh_theme') === 'dark')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('sh_theme', dark ? 'dark' : 'light')
  }, [dark])

  // close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  return (
    <div className={styles.app}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}> 
        {/* User info */}
        {user && (
          <div style={{ padding: '18px 0 8px 0', borderBottom: '1px solid var(--border)', marginBottom: 18, textAlign: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--accent)' }}>{user.user_metadata?.name || user.email}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>{user.email}</div>
          </div>
        )}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📚</div>
          <span className={styles.logoText}>StudyHub</span>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ label, to, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Button size="sm" variant="ghost" className={styles.logoutBtn} onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}>Logout</Button>
          <span className={styles.version}>v1.0 · Supabase</span>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className={styles.topbarSpacer} />

          <NavLink to="/search" className={styles.searchBtn}>
            <Search size={14} />
            <span className={styles.searchText}>Search…</span>
            <kbd className={styles.kbd}>Ctrl K</kbd>
          </NavLink>

          <button className={styles.themeBtn} onClick={() => setDark(d => !d)}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
