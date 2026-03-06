import React, { useState, useEffect, useCallback } from 'react';
import { dsaAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import Icon from '../shared/Icon';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import Spinner from '../shared/Spinner';

const DIFF_BADGE = { Easy: 'badge-green', Medium: 'badge-yellow', Hard: 'badge-red' };
const STATUS_LABEL = { 'not-started': 'Not Started', 'in-progress': 'In Progress', 'completed': 'Completed' };
const STATUS_COLOR = { 'not-started': 'var(--text3)', 'in-progress': 'var(--yellow)', 'completed': 'var(--green)' };
const CYCLE = { 'not-started': 'in-progress', 'in-progress': 'completed', 'completed': 'not-started' };

const DSAPage = () => {
  const [problems, setProblems] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', url: '', topic: '', difficulty: 'Medium', status: 'not-started', notes: '' });
  const { execute, loading: saving } = useApi();
  const dSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDiff) params.difficulty = filterDiff;
      if (dSearch) params.search = dSearch;
      const { data } = await dsaAPI.getAll(params);
      setProblems(data.data);
      setMeta(data.meta || {});
    } finally { setLoading(false); }
  }, [filterStatus, filterDiff, dSearch]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (p, next) => {
    const r = await execute(() => dsaAPI.update(p._id, { status: next }));
    setProblems(prev => prev.map(x => x._id === p._id ? r : x));
  };

  const saveProblem = async () => {
    if (!form.title?.trim()) return;
    if (editing) {
      const r = await execute(() => dsaAPI.update(editing._id, form), { successMsg: 'Problem updated' });
      setProblems(prev => prev.map(x => x._id === editing._id ? r : x));
    } else {
      const r = await execute(() => dsaAPI.create(form), { successMsg: 'Problem added' });
      setProblems(prev => [r, ...prev]);
    }
    setShowModal(false);
  };

  const deleteProblem = async (id) => {
    if (!window.confirm('Delete this problem?')) return;
    await execute(() => dsaAPI.delete(id), { successMsg: 'Problem deleted' });
    setProblems(prev => prev.filter(x => x._id !== id));
  };

  const statMap = {};
  if (meta?.stats) {
    if (Array.isArray(meta.stats)) {
      meta.stats.forEach(s => { if (s?._id) statMap[s._id] = s.count; });
    } else {
      Object.assign(statMap, meta.stats);
    }
  }



  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">DSA Problem Tracker</div>
          <div className="page-subtitle">{problems.length} problem{problems.length !== 1 ? 's' : ''} · {statMap.completed || 0} solved</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setForm({ title: '', url: '', topic: '', difficulty: 'Medium', status: 'not-started', notes: '' }); setEditing(null); setShowModal(true); }}><Icon name="plus" size={15} />Add Problem</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 mb-4">
        {['not-started', 'in-progress', 'completed'].map(s => (
          <div key={s} className="card-sm flex items-center gap-3" style={{ cursor: 'pointer', borderLeft: `3px solid ${STATUS_COLOR[s]}` }} onClick={() => setFilterStatus(f => f === s ? '' : s)}>
            <div style={{ fontSize: 28, fontWeight: 800, color: STATUS_COLOR[s] }}>{statMap[s] || 0}</div>
            <div className="text-sm" style={{ color: 'var(--text2)' }}>{STATUS_LABEL[s]}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="dsa-filters flex gap-3 mb-4 flex-wrap">
        <div className="search-bar flex-1" style={{ maxWidth: 320 }}>
          <Icon name="search" size={15} />
          <input placeholder="Search problems..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="form-control" style={{ width: 'auto' }} value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
          <option value="">All Difficulty</option>
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
      </div>

      {loading ? <div style={{ textAlign: 'center', paddingTop: 40 }}><Spinner size={28} /></div>
        : problems.length === 0 ? <EmptyState emoji="💻" title="No problems found" description="Track your DSA journey problem by problem" action={<button className="btn btn-primary" onClick={() => { setForm({ title: '', url: '', topic: '', difficulty: 'Medium', status: 'not-started', notes: '' }); setEditing(null); setShowModal(true); }}><Icon name="plus" size={14} />Add Problem</button>} />
          : problems.map(p => (
            <div key={p._id} className="dsa-item">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span style={{ fontWeight: 700, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{p.title}</span>
                  <span className={`badge ${DIFF_BADGE[p.difficulty]}`}>{p.difficulty}</span>
                </div>
                {p.topic && <div className="text-xs text-muted">{p.topic}</div>}
              </div>
              <div className="flex gap-2 items-center">
                <select
                  className="form-control"
                  style={{ width: 'auto', height: 28, padding: '0 8px', fontSize: 11.5, borderRadius: 6, cursor: 'pointer', background: 'var(--bg2)', borderColor: 'var(--border)' }}
                  value={p.status}
                  onChange={(e) => updateStatus(p, e.target.value)}
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm btn-icon" title="Open problem" style={{ height: 28, width: 28 }}><Icon name="eye" size={13} /></a>}
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setForm({ title: p.title, url: p.url || '', topic: p.topic || '', difficulty: p.difficulty, status: p.status, notes: p.notes || '' }); setEditing(p); setShowModal(true); }} style={{ height: 28, width: 28 }}><Icon name="edit" size={13} /></button>
                <button className="btn btn-ghost btn-sm btn-icon btn-danger" onClick={() => deleteProblem(p._id)} style={{ height: 28, width: 28 }}><Icon name="trash" size={13} /></button>
              </div>
            </div>
          ))
      }

      {showModal && (
        <Modal title={editing ? 'Edit Problem' : 'Add Problem'} onClose={() => setShowModal(false)}>
          <div className="form-group"><label className="form-label">Problem Title *</label><input className="form-control" placeholder="e.g. Two Sum" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus /></div>
          <div className="form-group"><label className="form-label">URL (optional)</label><input className="form-control" placeholder="https://leetcode.com/..." value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Topic</label><input className="form-control" placeholder="e.g. Arrays, Dynamic Programming..." value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Difficulty</label><select className="form-control" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}><option>Easy</option><option>Medium</option><option>Hard</option></select></div>
            <div className="form-group"><label className="form-label">Status</label><select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="not-started">Not Started</option><option value="in-progress">In Progress</option><option value="completed">Completed</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Notes (optional)</label><textarea className="form-control" style={{ minHeight: 70 }} placeholder="Approach, intuition, complexity..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveProblem} disabled={saving}>{saving ? <Spinner size={15} /> : 'Save'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default DSAPage;
