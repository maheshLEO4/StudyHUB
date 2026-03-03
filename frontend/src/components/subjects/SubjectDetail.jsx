import React, { useState } from 'react';
import { subjectsAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import Icon from '../shared/Icon';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import Badge from '../shared/Badge';

const SubjectDetail = ({ subject, onBack, onUpdate }) => {
  const [tab, setTab] = useState('notes');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', important: false });
  const { execute, loading: saving } = useApi();

  const notes = subject.notes || [];
  const regular = notes.filter((n) => !n.important);
  const important = notes.filter((n) => n.important);
  const displayed = tab === 'important' ? important : regular;

  const openAddNote = () => { setNoteForm({ title: '', content: '', important: tab === 'important' }); setEditNote(null); setShowNoteModal(true); };
  const openEditNote = (n) => { setNoteForm({ title: n.title, content: n.content, important: n.important }); setEditNote(n); setShowNoteModal(true); };

  const saveNote = async () => {
    if (!noteForm.title.trim()) return;
    let updated;
    if (editNote) {
      updated = await execute(() => subjectsAPI.updateNote(subject._id, editNote._id, noteForm), { successMsg: 'Note updated' });
    } else {
      updated = await execute(() => subjectsAPI.addNote(subject._id, noteForm), { successMsg: 'Note added' });
    }
    // Refresh subject data
    const { data } = await subjectsAPI.getOne(subject._id);
    onUpdate(data.data);
    setShowNoteModal(false);
  };

  const deleteNote = async (nId) => {
    if (!window.confirm('Delete this note?')) return;
    await execute(() => subjectsAPI.deleteNote(subject._id, nId), { successMsg: 'Note deleted' });
    const { data } = await subjectsAPI.getOne(subject._id);
    onUpdate(data.data);
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-sm" onClick={onBack}><Icon name="chevronLeft" size={14} />Back</button>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: subject.color }} />
          <div className="page-title">{subject.name}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={openAddNote}><Icon name="plus" size={14} />Add Note</button>
        </div>
      </div>
      {subject.description && <div className="text-sm text-muted mb-4">{subject.description}</div>}

      <div className="tabs mb-4" style={{ maxWidth: 400 }}>
        <button className={`tab ${tab === 'notes' ? 'tab--active' : ''}`} onClick={() => setTab('notes')}>All Notes ({regular.length})</button>
        <button className={`tab ${tab === 'important' ? 'tab--active' : ''}`} onClick={() => setTab('important')}>⭐ Important ({important.length})</button>
      </div>

      {displayed.length === 0 && <EmptyState emoji={tab === 'important' ? '⭐' : '📝'} title={tab === 'important' ? 'No important notes' : 'No notes yet'} description={tab === 'important' ? 'Mark notes as important to see them here' : 'Add your first note for this subject'} action={<button className="btn btn-primary btn-sm" onClick={openAddNote}><Icon name="plus" size={13} />Add Note</button>} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {displayed.map((n) => (
          <div key={n._id} className={`note-card ${n.important ? 'note-card--important' : ''}`} style={{ padding: '8px 12px', borderRadius: 10 }}>
            <div className="flex items-center justify-between">
              <div
                style={{ cursor: 'pointer', flex: 1, minWidth: 0, paddingRight: 10 }}
                onClick={() => openEditNote(n)}
                title="Click to edit note"
              >
                <div className="note-title" style={{ fontSize: 13, marginBottom: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {n.important && <Icon name="star" size={11} style={{ color: 'var(--yellow)', fill: 'var(--yellow)' }} />}
                  <span className="truncate" style={{ fontWeight: 700 }}>{n.title}</span>
                </div>
                <div className="note-preview" style={{ fontSize: 12, opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {n.content || <em style={{ opacity: 0.5 }}>No content</em>}
                </div>
              </div>
              <div className="flex gap-1" style={{ flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEditNote(n)} style={{ width: 26, height: 26, border: 'none' }} title="Edit"><Icon name="edit" size={12} /></button>
                <button className="btn btn-ghost btn-sm btn-icon btn-danger" onClick={() => deleteNote(n._id)} style={{ width: 26, height: 26, border: 'none' }} title="Delete"><Icon name="trash" size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNoteModal && (
        <Modal title={editNote ? 'Edit Note' : 'Add Note'} onClose={() => setShowNoteModal(false)}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-control" placeholder="Note title" value={noteForm.title} onChange={(e) => setNoteForm((f) => ({ ...f, title: e.target.value }))} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea className="form-control" style={{ minHeight: 150 }} placeholder="Write your notes here..." value={noteForm.content} onChange={(e) => setNoteForm((f) => ({ ...f, content: e.target.value }))} />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={noteForm.important} onChange={(e) => setNoteForm((f) => ({ ...f, important: e.target.checked }))} />
              <span className="form-label" style={{ margin: 0 }}>⭐ Mark as Important</span>
            </label>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowNoteModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveNote}>Save Note</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SubjectDetail;
