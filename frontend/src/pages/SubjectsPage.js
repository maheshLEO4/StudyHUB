import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, FileText, Star, Folder, X, BookOpen } from 'lucide-react';
import Layout from '../components/layout/Layout';
import NoteEditor from '../components/notes/NoteEditor';
import { subjectsAPI, notesAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';

const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6', '#06b6d4'];
const ICONS = ['📚', '🔬', '🧮', '💻', '📐', '📝', '🎨', '🌍', '⚗️', '🎵', '📊', '🏛️'];

// ── Subject Modal ───────────────────────────────────────────────
function SubjectModal({ subject, onClose, onSaved, toast }) {
  const [form, setForm] = useState({ name: subject?.name || '', description: subject?.description || '', color: subject?.color || COLORS[0], icon: subject?.icon || '📚' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name.trim()) return toast('Subject name required', 'error');
    setSaving(true);
    try {
      if (subject) await subjectsAPI.update(subject._id, form);
      else await subjectsAPI.create(form);
      toast(subject ? 'Subject updated' : 'Subject created', 'success');
      onSaved();
    } catch (e) { toast(e.response?.data?.message || 'Error', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{subject ? 'Edit Subject' : 'New Subject'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Subject Name *</label>
          <input className="form-control" placeholder="e.g. Data Structures & Algorithms" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus onKeyDown={e => e.key === 'Enter' && save()} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" placeholder="Brief description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 70 }} />
        </div>
        <div className="form-group">
          <label className="form-label">Icon</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ICONS.map(ic => (
              <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))}
                style={{ fontSize: 20, background: form.icon === ic ? 'var(--accent-bg)' : 'var(--surface2)', border: `2px solid ${form.icon === ic ? 'var(--accent)' : 'transparent'}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', transition: 'all .15s' }}>
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid var(--text)' : '3px solid transparent', transition: 'border .15s', transform: form.color === c ? 'scale(1.15)' : 'scale(1)' }} />
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : 'Save Subject'}</button>
        </div>
      </div>
    </div>
  );
}

// ── Note Card ───────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div
      onClick={() => onEdit(note)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
        padding: '12px 14px', marginBottom: 6, cursor: 'pointer', transition: 'all .15s',
        borderLeft: note.is_important ? '3px solid var(--yellow)' : '1px solid var(--border)',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 5 }}>
          {note.is_important && <Star size={12} fill="var(--yellow)" color="var(--yellow)" />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</span>
        </div>
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost btn-icon-sm" onClick={() => onEdit(note)}><Edit2 size={12} /></button>
          <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => onDelete(note._id)}><Trash2 size={12} /></button>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        dangerouslySetInnerHTML={{ __html: note.content?.replace(/<[^>]*>/g, ' ').trim() || 'No content' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
        {note.tags?.map(t => <span key={t} className="badge badge-gray" style={{ fontSize: 9 }}>#{t}</span>)}
        <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>{format(new Date(note.createdAt), 'MMM d')}</span>
      </div>
    </div>
  );
}

// ── Subject Detail View ─────────────────────────────────────────
function SubjectDetail({ subject, onBack, toast }) {
  const [notes, setNotes] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const loadNotes = async () => {
    setLoading(true);
    try { const r = await notesAPI.getAll({ subject: subject._id }); setNotes(r.data.data || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadNotes(); }, [subject._id]);

  const deleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try { await notesAPI.delete(id); toast('Note deleted', 'success'); loadNotes(); }
    catch { toast('Error deleting note', 'error'); }
  };

  const filtered = tab === 'important' ? notes.filter(n => n.is_important) : notes;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ gap: 4 }}>
            <ChevronLeft size={15} /> Back
          </button>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: subject.color, flexShrink: 0 }} />
          <div>
            <div className="page-title">{subject.icon} {subject.name}</div>
            {subject.description && <div className="page-subtitle">{subject.description}</div>}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setEditingNote(null); setShowEditor(true); }}>
            <Plus size={15} /> Add Note
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-4" style={{ maxWidth: 340 }}>
        <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
          All Notes ({notes.length})
        </button>
        <button className={`tab-btn ${tab === 'important' ? 'active' : ''}`} onClick={() => setTab('important')}>
          ⭐ Important ({notes.filter(n => n.is_important).length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FileText size={40} />
          <h3>No notes {tab === 'important' ? 'marked as important' : 'yet'}</h3>
          <p>Click "Add Note" to create your first note</p>
        </div>
      ) : (
        filtered.map(n => (
          <NoteCard key={n._id} note={n} onEdit={note => { setEditingNote(note); setShowEditor(true); }} onDelete={deleteNote} />
        ))
      )}

      {showEditor && (
        <NoteEditor
          note={editingNote}
          subjectId={subject._id}
          onClose={() => setShowEditor(false)}
          onSaved={() => { setShowEditor(false); loadNotes(); toast(editingNote ? 'Note updated' : 'Note created', 'success'); }}
        />
      )}
    </div>
  );
}

// ── Main Subjects Page ──────────────────────────────────────────
export default function SubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const loadSubjects = async () => {
    setLoading(true);
    try { const r = await subjectsAPI.getAll(); setSubjects(r.data.data || []); }
    catch { toast('Failed to load subjects', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSubjects(); }, []);

  const deleteSubject = async (id) => {
    if (!window.confirm('Delete this subject and ALL its notes?')) return;
    try { await subjectsAPI.delete(id); toast('Subject deleted', 'success'); loadSubjects(); }
    catch { toast('Error', 'error'); }
  };

  if (selectedSubject) return (
    <Layout currentPage={selectedSubject.name}>
      <SubjectDetail subject={selectedSubject} onBack={() => setSelectedSubject(null)} toast={toast} />
    </Layout>
  );

  return (
    <Layout currentPage="Subjects">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Subjects</div>
          <div className="page-subtitle">{subjects.length} subject{subjects.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setEditSubject(null); setShowModal(true); }}>
            <Plus size={15} /> Add Subject
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">📚</div>
          <h3>No subjects yet</h3>
          <p>Create your first subject to start organizing study materials</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Create Subject</button>
        </div>
      ) : (
        <div className="grid-3">
          {subjects.map(s => (
            <div
              key={s._id}
              onClick={() => setSelectedSubject(s)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
                padding: '18px 20px', cursor: 'pointer', transition: 'all .2s', position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = s.color + '66'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {/* Color accent top bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: '14px 14px 0 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 4 }}>
                <span style={{ fontSize: 26 }}>{s.icon}</span>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-icon-sm" onClick={() => { setEditSubject(s); setShowModal(true); }}><Edit2 size={13} /></button>
                  <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => deleteSubject(s._id)}><Trash2 size={13} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
              {s.description && <div style={{ fontSize: 12.5, color: 'var(--text2)', marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.description}</div>}
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--text3)' }}>
                <FileText size={11} style={{ marginRight: 4 }} />
                {s.noteCount || 0} notes
                <span style={{ color: s.color, marginLeft: 'auto', fontWeight: 700, fontSize: 11 }}>Open →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <SubjectModal
          subject={editSubject}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadSubjects(); }}
          toast={toast}
        />
      )}
    </Layout>
  );
}