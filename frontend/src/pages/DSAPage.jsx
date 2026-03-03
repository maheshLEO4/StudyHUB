/**
 * DSA Problem Tracker Page
 */

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, X, Loader, ExternalLink, Trash2, Edit2, Filter, Code2 } from 'lucide-react';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed'];
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];
const PLATFORMS = ['LeetCode', 'HackerRank', 'CodeForces', 'GeeksforGeeks', 'InterviewBit', 'Other'];

const difficultyColor = { Easy: 'success', Medium: 'warning', Hard: 'danger' };
const statusColor = { 'Not Started': 'status-not-started', 'In Progress': 'status-in-progress', Completed: 'status-completed' };

const ProblemModal = ({ problem, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: problem?.title || '',
    url: problem?.url || '',
    platform: problem?.platform || 'LeetCode',
    difficulty: problem?.difficulty || 'Medium',
    status: problem?.status || 'Not Started',
    topic: problem?.topic || '',
    notes: problem?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (problem) res = await api.put(`/dsa/${problem._id}`, form);
      else res = await api.post('/dsa', form);
      onSave(res.data, !!problem);
      onClose();
    } catch (err) {
      alert('Failed to save problem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{problem ? 'Edit Problem' : 'Add Problem'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Problem Title</label>
            <input className="form-input" type="text" placeholder="Two Sum" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Problem URL</label>
            <input className="form-input" type="url" placeholder="https://leetcode.com/problems/two-sum" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label">Platform</label>
              <select className="form-input form-select" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Topic</label>
              <input className="form-input" type="text" placeholder="Arrays, Trees, DP..." value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-input form-select" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                {DIFFICULTY_OPTIONS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} placeholder="Approach, key observations..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
              {problem ? 'Save Changes' : 'Add Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DSAPage = () => {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProblem, setEditProblem] = useState(null);
  const [filters, setFilters] = useState({ status: '', difficulty: '' });

  const fetchProblems = async () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    const [probRes, statsRes] = await Promise.all([api.get('/dsa', { params }), api.get('/dsa/stats')]);
    setProblems(probRes.data);
    setStats(statsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchProblems(); }, [filters]);

  const handleSave = (prob, isEdit) => {
    if (isEdit) setProblems((p) => p.map((x) => (x._id === prob._id ? prob : x)));
    else setProblems((p) => [prob, ...p]);
    api.get('/dsa/stats').then((r) => setStats(r.data));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem?')) return;
    await api.delete(`/dsa/${id}`);
    setProblems((p) => p.filter((x) => x._id !== id));
    api.get('/dsa/stats').then((r) => setStats(r.data));
  };

  const handleStatusChange = async (problem, newStatus) => {
    const { data } = await api.put(`/dsa/${problem._id}`, { status: newStatus });
    setProblems((p) => p.map((x) => (x._id === data._id ? data : x)));
    api.get('/dsa/stats').then((r) => setStats(r.data));
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>DSA Tracker</h1>
          <p>Track your Data Structures & Algorithms practice</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditProblem(null); setShowModal(true); }}>
          <Plus size={18} /> Add Problem
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Problems</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-success)' }}>{stats.completed}</div><div className="stat-label">Completed</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--color-warning)' }}>{stats.inProgress}</div><div className="stat-label">In Progress</div></div>
          <div className="stat-card">
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>{stats.easy}</span>
              <span style={{ color: 'var(--color-warning)', fontWeight: 700 }}>{stats.medium}</span>
              <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{stats.hard}</span>
            </div>
            <div className="stat-label">E / M / H Solved</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={16} style={{ color: 'var(--text-tertiary)' }} />
        <select className="form-input form-select" style={{ width: 'auto' }} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="form-input form-select" style={{ width: 'auto' }} value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
          <option value="">All Difficulty</option>
          {DIFFICULTY_OPTIONS.map((d) => <option key={d}>{d}</option>)}
        </select>
        {(filters.status || filters.difficulty) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status: '', difficulty: '' })}>Clear filters</button>
        )}
      </div>

      {/* Problems Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 70 }} />)}
        </div>
      ) : problems.length === 0 ? (
        <div className="card"><div className="empty-state"><Code2 size={36} style={{ opacity: 0.3 }} /><h3>No problems found</h3><p>Start tracking your DSA problems.</p><button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Problem</button></div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {problems.map((prob) => (
            <div key={prob._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{prob.title}</span>
                  <span className={`badge badge-${difficultyColor[prob.difficulty]}`}>{prob.difficulty}</span>
                  {prob.topic && <span className="badge badge-subtle">{prob.topic}</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{prob.platform}</div>
              </div>

              <select
                className={`badge ${statusColor[prob.status]}`}
                style={{ cursor: 'pointer', border: 'none', fontFamily: 'var(--font-sans)', fontSize: '0.7rem', fontWeight: 600 }}
                value={prob.status}
                onChange={(e) => handleStatusChange(prob, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <div style={{ display: 'flex', gap: 4 }}>
                {prob.url && <a href={prob.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon btn-sm" title="Open problem"><ExternalLink size={14} /></a>}
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditProblem(prob); setShowModal(true); }}><Edit2 size={14} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(prob._id)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProblemModal
          problem={editProblem}
          onClose={() => { setShowModal(false); setEditProblem(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default DSAPage;
