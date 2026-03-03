/**
 * Links Page
 * Save, categorize, and manage important links
 */

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, X, Loader, ExternalLink, Trash2, Edit2, Link2 } from 'lucide-react';

const CATEGORIES = ['DSA Problems', 'YouTube Tutorials', 'Articles', 'Coding Platforms', 'Documentation', 'Other'];
const categoryColors = {
  'DSA Problems': '#6366f1',
  'YouTube Tutorials': '#ef4444',
  'Articles': '#f59e0b',
  'Coding Platforms': '#10b981',
  'Documentation': '#06b6d4',
  'Other': '#8b5cf6',
};

const LinkModal = ({ link, onClose, onSave }) => {
  const [form, setForm] = useState({ title: link?.title || '', url: link?.url || '', description: link?.description || '', category: link?.category || 'Other', tags: link?.tags || [] });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagInput.trim())) setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (link) res = await api.put(`/links/${link._id}`, form);
      else res = await api.post('/links', form);
      onSave(res.data, !!link);
      onClose();
    } catch (err) {
      alert('Failed to save link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{link ? 'Edit Link' : 'Save Link'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" type="text" placeholder="Link title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">URL</label>
            <input className="form-input" type="url" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} placeholder="What is this link about?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tags-container">
              {form.tags.map((tag) => (
                <span key={tag} className="tag-chip">{tag}<button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}>×</button></span>
              ))}
              <input className="tags-input" placeholder="Add tag, press Enter..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
              {link ? 'Save Changes' : 'Save Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LinksPage = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLink, setEditLink] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');

  const fetchLinks = async () => {
    const params = {};
    if (filterCategory) params.category = filterCategory;
    const { data } = await api.get('/links', { params });
    setLinks(data);
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, [filterCategory]);

  const handleSave = (link, isEdit) => {
    if (isEdit) setLinks((l) => l.map((x) => (x._id === link._id ? link : x)));
    else setLinks((l) => [link, ...l]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    await api.delete(`/links/${id}`);
    setLinks((l) => l.filter((x) => x._id !== id));
  };

  // Group by category
  const grouped = links.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {});

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>Important Links</h1>
          <p>Save and organize your important resources</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditLink(null); setShowModal(true); }}>
          <Plus size={18} /> Save Link
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        <button className={`btn ${!filterCategory ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilterCategory('')}>All</button>
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`btn ${filterCategory === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilterCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid-2">{[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}</div>
      ) : links.length === 0 ? (
        <div className="card"><div className="empty-state"><Link2 size={36} style={{ opacity: 0.3 }} /><h3>No links saved</h3><p>Start saving important links for your studies.</p><button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Save Link</button></div></div>
      ) : filterCategory ? (
        <div className="grid-2">
          {links.map((link) => <LinkCard key={link._id} link={link} onEdit={() => { setEditLink(link); setShowModal(true); }} onDelete={() => handleDelete(link._id)} />)}
        </div>
      ) : (
        Object.entries(grouped).map(([category, catLinks]) => (
          <div key={category} style={{ marginBottom: 'var(--space-8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: categoryColors[category] || '#6b7280', flexShrink: 0 }} />
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>{category}</h2>
              <span className="badge badge-subtle">{catLinks.length}</span>
            </div>
            <div className="grid-2">
              {catLinks.map((link) => <LinkCard key={link._id} link={link} onEdit={() => { setEditLink(link); setShowModal(true); }} onDelete={() => handleDelete(link._id)} />)}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <LinkModal
          link={editLink}
          onClose={() => { setShowModal(false); setEditLink(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

const LinkCard = ({ link, onEdit, onDelete }) => (
  <div className="card card-hover" style={{ borderLeft: `4px solid ${categoryColors[link.category] || '#6b7280'}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <a href={link.url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span className="text-ellipsis">{link.title}</span>
          <ExternalLink size={12} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
        </a>
        {link.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{link.description}</p>}
        {link.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
            {link.tags.map((tag) => <span key={tag} className="badge badge-subtle">{tag}</span>)}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><Edit2 size={14} /></button>
        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger)' }} onClick={onDelete}><Trash2 size={14} /></button>
      </div>
    </div>
  </div>
);

export default LinksPage;
