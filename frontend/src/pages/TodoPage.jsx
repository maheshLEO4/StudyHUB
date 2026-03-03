/**
 * To-Do Lists Page
 * Create and manage multiple checklists with tasks
 */

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, X, Loader, Trash2, Edit2, CheckSquare, Square, Calendar, Flag, ChevronDown, ChevronRight } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

const PRIORITIES = ['Low', 'Medium', 'High'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const priorityIcon = (p) => {
  const colors = { Low: 'var(--color-success)', Medium: 'var(--color-warning)', High: 'var(--color-danger)' };
  return <Flag size={12} style={{ color: colors[p] }} />;
};

const ListModal = ({ list, onClose, onSave }) => {
  const [form, setForm] = useState({ title: list?.title || '', color: list?.color || '#6366f1' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (list) res = await api.put(`/todos/${list._id}`, form);
      else res = await api.post('/todos', form);
      onSave(res.data, !!list);
      onClose();
    } catch (err) {
      alert('Failed to save list.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2>{list ? 'Edit List' : 'New Checklist'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">List Name</label>
            <input className="form-input" type="text" placeholder="e.g., Week 1 DSA Tasks" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {COLORS.map((c) => <button key={c} type="button" className={`color-dot ${form.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />)}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
              {list ? 'Save' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddTaskForm = ({ listId, onAdd }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { data } = await api.post(`/todos/${listId}/tasks`, { title, priority, dueDate: dueDate || undefined });
    onAdd(data);
    setTitle('');
    setDueDate('');
    setExpanded(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-3)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <input
          className="form-input"
          type="text"
          placeholder="Add a task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1 }}
          onFocus={() => setExpanded(true)}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={!title.trim()}><Plus size={16} /></button>
      </div>
      {expanded && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
          <select className="form-input form-select" style={{ width: 'auto', fontSize: '0.8rem', padding: 'var(--space-1) var(--space-3)' }} value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <input className="form-input" type="date" style={{ width: 'auto', fontSize: '0.8rem', padding: 'var(--space-1) var(--space-3)' }} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      )}
    </form>
  );
};

const TodoPage = () => {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editList, setEditList] = useState(null);
  const [collapsed, setCollapsed] = useState({});

  const fetchLists = async () => {
    const { data } = await api.get('/todos');
    setLists(data);
    setLoading(false);
  };

  useEffect(() => { fetchLists(); }, []);

  const handleSave = (list, isEdit) => {
    if (isEdit) setLists((l) => l.map((x) => (x._id === list._id ? list : x)));
    else setLists((l) => [list, ...l]);
  };

  const handleDeleteList = async (id) => {
    if (!window.confirm('Delete this entire checklist?')) return;
    await api.delete(`/todos/${id}`);
    setLists((l) => l.filter((x) => x._id !== id));
  };

  const handleTaskUpdate = (listId, updatedList) => {
    setLists((l) => l.map((x) => (x._id === listId ? updatedList : x)));
  };

  const toggleTask = async (list, task) => {
    const { data } = await api.put(`/todos/${list._id}/tasks/${task._id}`, { completed: !task.completed });
    handleTaskUpdate(list._id, data);
  };

  const deleteTask = async (list, taskId) => {
    const { data } = await api.delete(`/todos/${list._id}/tasks/${taskId}`);
    handleTaskUpdate(list._id, data);
  };

  const addTask = (listId, updatedList) => {
    setLists((l) => l.map((x) => (x._id === listId ? updatedList : x)));
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>To-Do Lists</h1>
          <p>Create and manage your study checklists</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditList(null); setShowModal(true); }}>
          <Plus size={18} /> New List
        </button>
      </div>

      {loading ? (
        <div className="grid-2">{[1,2].map(i => <div key={i} className="skeleton" style={{ height: 200 }} />)}</div>
      ) : lists.length === 0 ? (
        <div className="card"><div className="empty-state"><CheckSquare size={36} style={{ opacity: 0.3 }} /><h3>No checklists yet</h3><p>Create your first checklist to track tasks.</p><button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create List</button></div></div>
      ) : (
        <div className="grid-2">
          {lists.map((list) => {
            const total = list.tasks.length;
            const done = list.tasks.filter((t) => t.completed).length;
            const isCollapsed = collapsed[list._id];

            return (
              <div key={list._id} className="card" style={{ borderTop: `4px solid ${list.color}` }}>
                {/* List header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setCollapsed((c) => ({ ...c, [list._id]: !c[list._id] }))}>
                      {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{list.title}</h3>
                    {total > 0 && <span className="badge badge-subtle">{done}/{total}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditList(list); setShowModal(true); }}><Edit2 size={14} /></button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDeleteList(list._id)}><Trash2 size={14} /></button>
                  </div>
                </div>

                {/* Progress bar */}
                {total > 0 && (
                  <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', height: 4, marginBottom: 'var(--space-3)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(done / total) * 100}%`, background: list.color, borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
                  </div>
                )}

                {/* Tasks */}
                {!isCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {list.tasks.sort((a, b) => a.completed - b.completed).map((task) => {
                      const overdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed && !isToday(new Date(task.dueDate));
                      return (
                        <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', opacity: task.completed ? 0.6 : 1 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toggleTask(list, task)} style={{ color: task.completed ? 'var(--color-success)' : 'var(--text-tertiary)', flexShrink: 0 }}>
                            {task.completed ? <CheckSquare size={18} style={{ fill: 'var(--color-success)', color: 'var(--color-success)' }} /> : <Square size={18} />}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {task.title}
                            </div>
                            {task.dueDate && (
                              <div style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 4, color: overdue ? 'var(--color-danger)' : 'var(--text-tertiary)' }}>
                                <Calendar size={10} />
                                {format(new Date(task.dueDate), 'MMM d')}
                                {overdue && ' · Overdue'}
                              </div>
                            )}
                          </div>
                          {priorityIcon(task.priority)}
                          <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--text-tertiary)' }} onClick={() => deleteTask(list, task._id)}><Trash2 size={13} /></button>
                        </div>
                      );
                    })}

                    <AddTaskForm listId={list._id} onAdd={(updatedList) => addTask(list._id, updatedList)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ListModal
          list={editList}
          onClose={() => { setShowModal(false); setEditList(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default TodoPage;
