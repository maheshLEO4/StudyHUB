import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const { register, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast('Password must be at least 6 characters', 'error');
    const res = await register(form.name, form.email, form.password);
    if (res.success) { toast('Account created! Welcome.', 'success'); navigate('/'); }
    else toast(res.message, 'error');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'var(--accent)', borderRadius: 16, display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: 'white' }}>
            <GraduationCap size={28} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -.5 }}>StudyHub</h1>
          <p style={{ color: 'var(--text3)', marginTop: 4, fontSize: 14 }}>Create your free account</p>
        </div>
        <div className="card">
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 22 }}>Get started for free</h2>
          <form onSubmit={handleSubmit}>
            {['name', 'email', 'password'].map(field => (
              <div className="form-group" key={field}>
                <label className="form-label">{field === 'name' ? 'Full Name' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input className="form-control" type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'} placeholder={field === 'email' ? 'you@university.edu' : field === 'password' ? 'Min. 6 characters' : 'Your full name'} value={form[field]} onChange={set(field)} required />
              </div>
            ))}
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center', height: 44, fontSize: 14 }} disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text3)' }}>
            Have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}