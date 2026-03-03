import React, { useState, useEffect, useCallback } from 'react';
import { subjectsAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import Icon from '../shared/Icon';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import Spinner from '../shared/Spinner';
import SubjectDetail from './SubjectDetail';
import toast from 'react-hot-toast';

const COLORS = ['#c8521a','#1d5fa8','#2e7d52','#6b3fa0','#c49b12','#1d8a8a','#c0392b','#2196F3'];

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0] });
  const { execute, loading: saving } = useApi();

  const load = useCallback(async () => {
    try {
      const { data } = await subjectsAPI.getAll();
      setSubjects(data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm({ name: '', description: '', color: COLORS[0] }); setEditing(null); setShowModal(true); };
  const openEdit = (s, e) => { e.stopPropagation(); setForm({ name: s.name, description: s.description || '', color: s.color }); setEditing(s); setShowModal(true); };

  const saveSubject = async () => {
    if (!form.name.trim()) return;
    if (editing) {
      const result = await execute(() => subjectsAPI.update(editing._id, form), { successMsg: 'Subject updated' });
      setSubjects((prev) => prev.map((s) => s._id === editing._id ? result : s));
    } else {
      const result = await execute(() => subjectsAPI.create(form), { successMsg: 'Subject created' });
      setSubjects((prev) => [...prev, result]);
    }
    setShowModal(false);
  };

  const deleteSubject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this subject and all its content?')) return;
    await execute(() => subjectsAPI.delete(id), { successMsg: 'Subject deleted' });
    setSubjects((prev) => prev.filter((s) => s._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  if (selected) return <SubjectDetail subject={subjects.find(s => s._id === selected._id) || selected} onBack={() => { setSelected(null); load(); }} onUpdate={(s) => setSubjects(p => p.map(x => x._id === s._id ? s : x))} />;

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 60 }}><Spinner size={32} /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Subjects</div>
          <div className="page-subtitle">{subjects.length} subject{subjects.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}><Icon name="plus" size={15} />New Subject</button>
        </div>
      </div>

      {subjects.length === 0 && <EmptyState emoji="📚" title="No subjects yet" description="Create your first subject to start organizing notes and materials" action={<button className="btn btn-primary" onClick={openAdd}><Icon name="plus" size={15} />Create Subject</button>} />}

      <div className="grid-3">
        {subjects.map((s) => (
          <div key={s._id} className="subject-card" style={{ '--subject-color': s.color }} onClick={() => setSelected(s)}>
            <div className="flex justify-between items-center" style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 16, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={(e) => openEdit(s, e)}><Icon name="edit" size={13} /></button>
                <button className="btn btn-danger btn-sm btn-icon" onClick={(e) => deleteSubject(s._id, e)}><Icon name="trash" size={13} /></button>
              </div>
            </div>
            {s.description && <div className="text-sm text-muted mb-3" style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{s.description}</div>}
            <div className="flex gap-3 text-xs text-muted">
              <span><Icon name="book" size={12} /> {s.notes?.length || 0} notes</span>
              <span style={{ color: s.color, marginLeft: 'auto', fontWeight: 600 }}>Open →</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Subject' : 'New Subject'} onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Subject Name *</label>
            <input className="form-control" placeholder="e.g. Data Structures & Algorithms" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input className="form-control" placeholder="Brief description..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <div key={c} onClick={() => setForm((f) => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid var(--text)' : '3px solid transparent', transition: 'border .15s', boxSizing: 'border-box' }} />
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveSubject} disabled={saving}>{saving ? <Spinner size={15} /> : 'Save Subject'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SubjectsPage;
