import { Routes, Route, Navigate } from 'react-router-dom'

import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import Subjects from '@/pages/Subjects'
import Tasks from '@/pages/Tasks'
import DailyTasks from '@/pages/DailyTasks'
import DSATracker from '@/pages/DSATracker'
import CalendarPage from '@/pages/CalendarPage'
import Links from '@/pages/Links'
import Search from '@/pages/Search'
import { Login, Register } from '@/pages/Auth'
import { useAuth } from './lib/auth.jsx'
import { useState } from 'react'

export default function App() {
  const { user, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(true)

  if (loading) return null

  if (!user) {
    return showLogin
      ? <Login onSuccess={() => window.location.reload()} switchToRegister={() => setShowLogin(false)} />
      : <Register onSuccess={() => setShowLogin(true)} switchToLogin={() => setShowLogin(true)} />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects/*" element={<Subjects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/daily" element={<DailyTasks />} />
        <Route path="/dsa" element={<DSATracker />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/links" element={<Links />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}
