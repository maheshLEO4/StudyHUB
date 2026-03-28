import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input, Button, Card } from '@/components/ui'

export function Register({ onSuccess, switchToLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { name, email, password } = form
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    setLoading(false)
    if (error) setError(error.message)
    else onSuccess?.(data)
  }

  return (
    <Card style={{ maxWidth: 380, margin: '40px auto', padding: 32 }}>
      <h2 style={{ marginBottom: 18 }}>Register</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
        {error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
        <Button type="button" variant="ghost" onClick={switchToLogin}>Already have an account? Login</Button>
      </form>
    </Card>
  )
}

export function Login({ onSuccess, switchToRegister }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { email, password } = form
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else onSuccess?.(data)
  }

  return (
    <Card style={{ maxWidth: 380, margin: '40px auto', padding: 32 }}>
      <h2 style={{ marginBottom: 18 }}>Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        {error && <div style={{ color: 'var(--red)', fontSize: 13 }}>{error}</div>}
        <Button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
        <Button type="button" variant="ghost" onClick={switchToRegister}>Don't have an account? Register</Button>
      </form>
    </Card>
  )
}
