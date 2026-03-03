import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../shared/Icon';
import Spinner from '../shared/Spinner';

const AuthPage = () => {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]     = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm]     = useState({ name: '', email: '', password: '' });

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') await signup(form);
      else await login({ email: form.email, password: form.password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Icon name="book" size={30} /></div>
          <h1>StudyHub</h1>
          <p>Your personal academic companion</p>
        </div>

        <div className="tabs" style={{ marginBottom: 22 }}>
          <button className={`tab ${mode === 'login' ? 'tab--active' : ''}`} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
          <button className={`tab ${mode === 'signup' ? 'tab--active' : ''}`} onClick={() => { setMode('signup'); setError(''); }}>Sign Up</button>
        </div>

        {error && <div className="alert alert-error"><Icon name="alert" size={15} />{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" placeholder="Jane Smith" value={form.name} onChange={set('name')} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" placeholder="you@university.edu" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={6} />
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ justifyContent: 'center', height: 44, fontSize: 14 }}>
            {loading ? <Spinner size={18} /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
