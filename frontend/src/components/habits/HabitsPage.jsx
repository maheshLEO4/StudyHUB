import React, { useState, useEffect, useCallback } from 'react';
import { habitsAPI } from '../../services/api';
import Icon from '../shared/Icon';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import Spinner from '../shared/Spinner';
import toast from 'react-hot-toast';

const todayStr = new Date().toISOString().split('T')[0];

const HabitsPage = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await habitsAPI.getAll();
            setHabits(r.data.data || []);
        } catch (e) {
            toast.error('Failed to load daily tasks');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!form.name?.trim()) return;
        setSaving(true);
        try {
            if (editingHabit) {
                const r = await habitsAPI.update(editingHabit._id, form);
                setHabits(prev => prev.map(h => h._id === editingHabit._id ? r.data.data : h));
                toast.success('Task updated');
            } else {
                const r = await habitsAPI.create(form);
                setHabits(prev => [...prev, r.data.data]);
                toast.success('Task created');
            }
            setShowModal(false);
        } catch (e) {
            toast.error('Error saving task');
        } finally {
            setSaving(false);
        }
    };

    const toggle = async (h) => {
        // Optimistic update
        const isDone = h.completedDates.includes(todayStr);
        setHabits(prev => prev.map(x => {
            if (x._id !== h._id) return x;
            const dates = [...x.completedDates];
            if (isDone) dates.splice(dates.indexOf(todayStr), 1);
            else dates.push(todayStr);
            return { ...x, completedDates: dates };
        }));

        try {
            await habitsAPI.toggle(h._id);
        } catch (e) {
            toast.error('Error updating task');
            load();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task permanently?')) return;
        try {
            await habitsAPI.delete(id);
            setHabits(prev => prev.filter(h => h._id !== id));
            toast.success('Task removed');
        } catch (e) {
            toast.error('Error deleting task');
        }
    };

    const pending = habits.filter(h => !h.completedDates.includes(todayStr));
    const completed = habits.filter(h => h.completedDates.includes(todayStr));
    const pct = habits.length ? Math.round((completed.length / habits.length) * 100) : 0;

    const HabitItem = ({ h, isDone }) => (
        <div className={`todo-item ${isDone ? 'todo-item--done' : ''}`} style={{ opacity: isDone ? 0.7 : 1 }}>
            <button className={`todo-check ${isDone ? 'todo-check--done' : ''}`} onClick={() => toggle(h)}>
                {isDone && <Icon name="check" size={12} />}
            </button>
            <div style={{ flex: 1 }}>
                <div className={`todo-text ${isDone ? 'todo-text--done' : ''}`}>{h.name}</div>
                {h.description && <div className="text-xs text-muted">{h.description}</div>}
            </div>
            <div className="flex gap-1">
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setForm({ name: h.name, description: h.description || '' }); setEditingHabit(h); setShowModal(true); }}>
                    <Icon name="edit" size={12} />
                </button>
                <button className="btn btn-ghost btn-sm btn-icon btn-danger" onClick={() => handleDelete(h._id)}>
                    <Icon name="trash" size={12} />
                </button>
            </div>
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <div>
                    <div className="page-title">Daily Tasks</div>
                    <div className="page-subtitle">Build consistent habits and track your routine</div>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => { setForm({ name: '', description: '' }); setEditingHabit(null); setShowModal(true); }}>
                        <Icon name="plus" size={16} /> New Task
                    </button>
                </div>
            </div>

            {habits.length > 0 && (
                <div className="card mb-6" style={{ padding: 16 }}>
                    <div className="flex items-center justify-between mb-2">
                        <div style={{ fontWeight: 700, fontSize: 13 }}>Today's Progress</div>
                        <span className="badge badge-accent">{completed.length}/{habits.length} done</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                    </div>
                </div>
            )}

            {loading ? <div style={{ textAlign: 'center', padding: 40 }}><Spinner size={28} /></div>
                : habits.length === 0 ? <EmptyState emoji="🔥" title="No tasks set" description="Add your first daily task to start building your streak" />
                    : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {pending.length > 0 && (
                                <div>
                                    <div className="text-xs text-muted font-bold mb-2 uppercase tracking-wider">Pending ({pending.length})</div>
                                    <div className="flex flex-col gap-2">{pending.map(h => <HabitItem key={h._id} h={h} isDone={false} />)}</div>
                                </div>
                            )}
                            {completed.length > 0 && (
                                <div>
                                    <div className="text-xs text-muted font-bold mb-2 uppercase tracking-wider">Completed ({completed.length})</div>
                                    <div className="flex flex-col gap-2">{completed.map(h => <HabitItem key={h._id} h={h} isDone={true} />)}</div>
                                </div>
                            )}
                        </div>
                    )
            }

            {showModal && (
                <Modal title={editingHabit ? 'Edit Task' : 'New Task'} onClose={() => setShowModal(false)}>
                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label className="form-label">Task Name *</label>
                            <input className="form-control" placeholder="e.g. Morning Meditation" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" placeholder="Optional details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <Spinner size={15} /> : 'Save Task'}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default HabitsPage;
