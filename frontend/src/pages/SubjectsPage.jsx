/**
 * Subjects Page
 * Create, edit, delete, and view subjects
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Edit2, Trash2, BookOpen, FileText, X, Loader } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
const ICONS = ['📚', '🧮', '💻', '🔬', '📖', '🗂️', '🎯', '⚡', '🌍', '🔢', '📊', '🧬'];

const SubjectModal = ({ subject, onClose, onSave }) => {
  const [form, setForm] = useState({
    name: subject?.name || '',
    description: subject?.description || '',
    color: subject?.color || '#6366f1',
    icon: subject?.icon || '📚',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (subject) {
        res = await api.put(`/subjects/${subject._id}`, form);
      } else {
        res = await api.post('/subjects', form);
      }
      onSave(res.data, !!subject);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{subject ? 'Edit Subject' : 'New Subject'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Subject Name</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g., Data Structures & Algorithms"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Brief description..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Icon</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-md)',
                      border: `2px solid ${form.icon === icon ? 'var(--color-primary)' : 'var(--border-color)'}`,
                      background: form.icon === icon ? 'var(--color-primary-light)' : 'var(--bg-subtle)',
                      fontSize: '1.1rem', cursor: 'pointer', transition: 'all var(--transition)'
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Color</label>
              <div className="color-picker">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-dot ${form.color === color ? 'selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setForm({ ...form, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
              {subject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const navigate = useNavigate();

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleSave = (subject, isEdit) => {
    if (isEdit) {
      setSubjects((prev) => prev.map((s) => (s._id === subject._id ? subject : s)));
    } else {
      setSubjects((prev) => [subject, ...prev]);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this subject and all its notes? This cannot be undone.')) return;
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert('Failed to delete subject.');
    }
  };

  const handleEdit = (subject, e) => {
    e.stopPropagation();
    setEditSubject(subject);
    setShowModal(true);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>Subjects</h1>
          <p>Organize your study materials by subject</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditSubject(null); setShowModal(true); }}>
          <Plus size={18} /> New Subject
        </button>
      </div>

      {loading ? (
        <div className="grid-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 160 }} />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No subjects yet</h3>
            <p>Create your first subject to start organizing your study materials.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={16} /> Create Subject
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="card card-hover subject-card"
              style={{ '--subject-color': subject.color, cursor: 'pointer' }}
              onClick={() => navigate(`/subjects/${subject._id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: '2rem' }}>{subject.icon}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => handleEdit(subject, e)} title="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => handleDelete(subject._id, e)} title="Delete" style={{ color: 'var(--color-danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontWeight: 600, marginBottom: 'var(--space-1)', fontSize: '1rem', color: 'var(--text-primary)' }}>{subject.name}</h3>
              {subject.description && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {subject.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'auto', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FileText size={12} /> {subject.notes?.length || 0} notes
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <BookOpen size={12} /> {subject.files?.length || 0} files
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <SubjectModal
          subject={editSubject}
          onClose={() => { setShowModal(false); setEditSubject(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default SubjectsPage;
