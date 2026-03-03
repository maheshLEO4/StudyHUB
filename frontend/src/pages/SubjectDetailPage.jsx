/**
 * Subject Detail Page
 * View and manage notes, files, and important notes within a subject
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Plus, Star, Trash2, Edit2, Upload, File, X, Loader, FileText, AlertCircle } from 'lucide-react';

// Simple rich-text (we'll use a contenteditable approach without react-quill dependency issues)
const RichTextEditor = ({ value, onChange }) => (
  <textarea
    className="form-input"
    rows={8}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Write your notes here... You can use Markdown-style formatting."
    style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', lineHeight: 1.7 }}
  />
);

const NoteModal = ({ note, subjectId, onClose, onSave }) => {
  const [form, setForm] = useState({ title: note?.title || '', content: note?.content || '', isImportant: note?.isImportant || false, tags: note?.tags || [] });
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
      if (note) {
        res = await api.put(`/subjects/${subjectId}/notes/${note._id}`, form);
      } else {
        res = await api.post(`/subjects/${subjectId}/notes`, form);
      }
      onSave(res.data);
      onClose();
    } catch (err) {
      alert('Failed to save note.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : 'Add Note'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" type="text" placeholder="Note title..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <RichTextEditor value={form.content} onChange={(content) => setForm({ ...form, content })} />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tags-container">
              {form.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}>×</button>
                </span>
              ))}
              <input className="tags-input" placeholder="Add tag, press Enter..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isImportant} onChange={(e) => setForm({ ...form, isImportant: e.target.checked })} />
            <Star size={16} style={{ color: form.isImportant ? '#f59e0b' : 'var(--text-tertiary)' }} />
            <span style={{ fontSize: '0.875rem' }}>Mark as Important</span>
          </label>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
              {note ? 'Save Changes' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SubjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | important | files
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const fetchSubject = async () => {
    try {
      const { data } = await api.get(`/subjects/${id}`);
      setSubject(data);
    } catch {
      navigate('/subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubject(); }, [id]);

  const handleNoteModalSave = async () => {
    await fetchSubject(); // Reload to get updated subdocuments
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    await api.delete(`/subjects/${id}/notes/${noteId}`);
    setSubject((prev) => ({ ...prev, notes: prev.notes.filter((n) => n._id !== noteId) }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/subjects/${id}/files`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchSubject();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    await api.delete(`/subjects/${id}/files/${fileId}`);
    setSubject((prev) => ({ ...prev, files: prev.files.filter((f) => f._id !== fileId) }));
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!subject) return null;

  const displayNotes = activeTab === 'important' ? subject.notes.filter((n) => n.isImportant) : subject.notes;

  return (
    <div className="page-container fade-in">
      {/* Back + Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/subjects')} style={{ marginBottom: 'var(--space-3)' }}>
          <ArrowLeft size={16} /> Back to Subjects
        </button>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: subject.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: `2px solid ${subject.color}30` }}>
              {subject.icon}
            </div>
            <div>
              <h1 style={{ borderLeft: `4px solid ${subject.color}`, paddingLeft: 'var(--space-3)' }}>{subject.name}</h1>
              {subject.description && <p>{subject.description}</p>}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditNote(null); setShowNoteModal(true); }}>
            <Plus size={16} /> Add Note
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-2)' }}>
        {[
          { key: 'all', label: `All Notes (${subject.notes.length})` },
          { key: 'important', label: `⭐ Important (${subject.notes.filter((n) => n.isImportant).length})` },
          { key: 'files', label: `📁 Files (${subject.files.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              background: 'none', border: 'none', padding: 'var(--space-2) var(--space-3)',
              fontSize: '0.875rem', fontWeight: activeTab === key ? 600 : 400,
              color: activeTab === key ? 'var(--color-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === key ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer', transition: 'all var(--transition)', marginBottom: -1, fontFamily: 'var(--font-sans)'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip" />
            <button className="btn btn-primary" onClick={() => fileInputRef.current.click()} disabled={uploading}>
              {uploading ? <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Upload size={16} />}
              Upload File
            </button>
          </div>

          {subject.files.length === 0 ? (
            <div className="card"><div className="empty-state"><File size={32} style={{ opacity: 0.3 }} /><h3>No files uploaded</h3><p>Upload PDFs, images, or documents for this subject.</p></div></div>
          ) : (
            <div className="grid-2">
              {subject.files.map((file) => (
                <div key={file._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <File size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{file.originalName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <a href={`http://localhost:5000${file.path}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon btn-sm" title="View">
                      <FileText size={14} />
                    </a>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteFile(file._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab !== 'files' && (
        <>
          {displayNotes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <div className="empty-icon">{activeTab === 'important' ? '⭐' : '📝'}</div>
                <h3>{activeTab === 'important' ? 'No important notes' : 'No notes yet'}</h3>
                <p>{activeTab === 'important' ? 'Star notes to mark them as important.' : 'Add your first note to this subject.'}</p>
                {activeTab === 'all' && <button className="btn btn-primary" onClick={() => setShowNoteModal(true)}><Plus size={16} /> Add Note</button>}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {displayNotes.map((note) => (
                <div key={note._id} className="card" style={{ borderLeft: note.isImportant ? '4px solid #f59e0b' : undefined }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {note.isImportant && <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
                      <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{note.title}</h3>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditNote(note); setShowNoteModal(true); }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteNote(note._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {note.content && (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', background: 'var(--bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                      {note.content.length > 400 ? note.content.slice(0, 400) + '...' : note.content}
                    </div>
                  )}

                  {note.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
                      {note.tags.map((tag) => <span key={tag} className="badge badge-subtle">{tag}</span>)}
                    </div>
                  )}

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-3)' }}>
                    {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showNoteModal && (
        <NoteModal
          note={editNote}
          subjectId={id}
          onClose={() => { setShowNoteModal(false); setEditNote(null); }}
          onSave={handleNoteModalSave}
        />
      )}
    </div>
  );
};

export default SubjectDetailPage;
