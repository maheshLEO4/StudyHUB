import React, { useState, useEffect, useCallback } from 'react';
import { todosAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import Icon from '../shared/Icon';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import Spinner from '../shared/Spinner';

const PCOLOR = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--green)' };
const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

const TodosPage = () => {
  const [checklists, setChecklists] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState('all');
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [editList, setEditList] = useState(null);
  const [todoForm, setTodoForm] = useState({ text: '', dueDate: '', priority: 'medium', checklist: '' });
  const [listForm, setListForm] = useState({ name: '', color: '#c8521a' });
  const { execute, loading: saving } = useApi();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cl, td] = await Promise.all([todosAPI.getChecklists(), todosAPI.getAll()]);
      setChecklists(cl.data.data);
      setTodos(td.data.data);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const displayed = activeList === 'all' ? todos : todos.filter(t => t.checklist === activeList);
  const pending = displayed.filter(t => !t.done);
  const done = displayed.filter(t => t.done);

  const toggleTodo = async (t) => {
    const r = await execute(() => todosAPI.update(t._id, { done: !t.done }));
    setTodos(prev => prev.map(x => x._id === t._id ? r : x));
  };

  const deleteTodo = async (id) => {
    await execute(() => todosAPI.delete(id), { successMsg: 'Task deleted' });
    setTodos(prev => prev.filter(x => x._id !== id));
  };

  const saveTodo = async () => {
    if (!todoForm.text?.trim()) return;
    const payload = { ...todoForm, checklist: todoForm.checklist || null };
    if (editTodo) {
      const r = await execute(() => todosAPI.update(editTodo._id, payload), { successMsg: 'Task updated' });
      setTodos(prev => prev.map(x => x._id === editTodo._id ? r : x));
    } else {
      const r = await execute(() => todosAPI.create(payload), { successMsg: 'Task created' });
      setTodos(prev => [...prev, r]);
    }
    setShowTodoModal(false);
  };

  const saveList = async () => {
    if (!listForm.name?.trim()) return;
    if (editList) {
      const r = await execute(() => todosAPI.updateChecklist(editList._id, listForm), { successMsg: 'List updated' });
      setChecklists(prev => prev.map(c => c._id === editList._id ? r : c));
    } else {
      const r = await execute(() => todosAPI.createChecklist(listForm), { successMsg: 'List created' });
      setChecklists(prev => [...prev, r]);
    }
    setShowListModal(false);
  };

  const deleteList = async (id) => {
    if (!window.confirm('Delete this list and all its tasks?')) return;
    await execute(() => todosAPI.deleteChecklist(id), { successMsg: 'List deleted' });
    setChecklists(prev => prev.filter(c => c._id !== id));
    setTodos(prev => prev.filter(t => t.checklist !== id));
    if (activeList === id) setActiveList('all');
  };

  const TodoItem = ({ t }) => (
    <div className={`todo-item ${t.done ? 'todo-item--done' : ''}`}>
      <button className={`todo-check ${t.done ? 'todo-check--done' : ''}`} onClick={() => toggleTodo(t)}>
        {t.done && <Icon name="check" size={12} />}
      </button>
      <div style={{ flex: 1 }}>
        <div className={`todo-text ${t.done ? 'todo-text--done' : ''}`}>{t.text}</div>
        {t.dueDate && <div className="text-xs text-muted">{fmtDate(t.dueDate)}</div>}
      </div>
      <div className="priority-dot" style={{ background: PCOLOR[t.priority] }} title={t.priority} />
      <div className="flex gap-1">
        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setTodoForm({ text: t.text, dueDate: t.dueDate || '', priority: t.priority, checklist: t.checklist || '' }); setEditTodo(t); setShowTodoModal(true); }}><Icon name="edit" size={12} /></button>
        <button className="btn btn-ghost btn-sm btn-icon btn-danger" onClick={() => deleteTodo(t._id)}><Icon name="trash" size={12} /></button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title">To-Do Lists</div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => { setListForm({ name: '', color: '#c8521a' }); setEditList(null); setShowListModal(true); }}><Icon name="plus" size={14} />New List</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setTodoForm({ text: '', dueDate: '', priority: 'medium', checklist: activeList === 'all' ? '' : activeList }); setEditTodo(null); setShowTodoModal(true); }}><Icon name="plus" size={14} />Add Task</button>
        </div>
      </div>

      <div className="tags mb-4">
        <span className={`tag ${activeList === 'all' ? 'tag--active' : ''}`} onClick={() => setActiveList('all')}>All ({todos.length})</span>
        {checklists.map(c => (
          <span key={c._id} className={`tag ${activeList === c._id ? 'tag--active' : ''}`} onClick={() => setActiveList(c._id)} style={{ position: 'relative' }}>
            {c.name} ({todos.filter(t => t.checklist === c._id).length})
          </span>
        ))}
      </div>

      {activeList !== 'all' && (
        <div className="flex gap-2 mb-4">
          <button className="btn btn-ghost btn-sm" onClick={() => { const c = checklists.find(c => c._id === activeList); setListForm({ name: c.name, color: c.color || '#c8521a' }); setEditList(c); setShowListModal(true); }}><Icon name="edit" size={13} />Rename</button>
          <button className="btn btn-danger btn-sm" onClick={() => deleteList(activeList)}><Icon name="trash" size={13} />Delete List</button>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', paddingTop: 40 }}><Spinner size={28} /></div>
        : displayed.length === 0 ? <EmptyState emoji="✅" title="No tasks here" description="Add tasks to stay on top of your studies" />
          : <>
            {pending.length > 0 && <div className="mb-4"><div className="text-xs text-muted font-bold mb-2" style={{ textTransform: 'uppercase', letterSpacing: '.5px' }}>Pending ({pending.length})</div>{pending.map(t => <TodoItem key={t._id} t={t} />)}</div>}
            {done.length > 0 && <div><div className="text-xs text-muted font-bold mb-2" style={{ textTransform: 'uppercase', letterSpacing: '.5px' }}>Completed ({done.length})</div>{done.map(t => <TodoItem key={t._id} t={t} />)}</div>}
          </>
      }

      {showTodoModal && (
        <Modal title={editTodo ? 'Edit Task' : 'Add Task'} onClose={() => setShowTodoModal(false)}>
          <div className="form-group"><label className="form-label">Task *</label><input className="form-control" placeholder="What needs to be done?" value={todoForm.text} onChange={e => setTodoForm(f => ({ ...f, text: e.target.value }))} autoFocus /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Due Date</label><input className="form-control" type="date" value={todoForm.dueDate} onChange={e => setTodoForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Priority</label><select className="form-control" value={todoForm.priority} onChange={e => setTodoForm(f => ({ ...f, priority: e.target.value }))}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
          </div>
          {checklists.length > 0 && <div className="form-group"><label className="form-label">Checklist</label><select className="form-control" value={todoForm.checklist} onChange={e => setTodoForm(f => ({ ...f, checklist: e.target.value }))}><option value="">None</option>{checklists.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowTodoModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveTodo} disabled={saving}>{saving ? <Spinner size={15} /> : 'Save Task'}</button>
          </div>
        </Modal>
      )}

      {showListModal && (
        <Modal title={editList ? 'Rename List' : 'New Checklist'} onClose={() => setShowListModal(false)}>
          <div className="form-group"><label className="form-label">List Name *</label><input className="form-control" placeholder="e.g. Week 1 Assignments" value={listForm.name} onChange={e => setListForm(f => ({ ...f, name: e.target.value }))} autoFocus onKeyDown={e => e.key === 'Enter' && saveList()} /></div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowListModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveList}>Save</button>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default TodosPage;
