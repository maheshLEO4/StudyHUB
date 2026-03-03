import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, Circle, Flame, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { habitsAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';

// ── Task Modal ──────────────────────────────────────────────────
function TaskModal({ editingTask, onClose, onSaved, toast }) {
    const [form, setForm] = useState({
        name: editingTask?.name || '',
        description: editingTask?.description || '',
    });
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!form.name.trim()) return toast('Task name required', 'error');
        setSaving(true);
        try {
            if (editingTask) {
                await habitsAPI.update(editingTask._id, form);
                toast('Task updated', 'success');
            } else {
                await habitsAPI.create(form);
                toast('Task created', 'success');
            }
            onSaved();
        } catch {
            toast('Error saving task', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">{editingTask ? 'Edit Task' : 'New Daily Task'}</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
                </div>
                <div className="form-group">
                    <label className="form-label">Task Name *</label>
                    <input
                        className="form-control"
                        placeholder="e.g. Read for 30 mins"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && save()}
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Goal / Description</label>
                    <input
                        className="form-control"
                        placeholder="Optional details..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={save} disabled={saving}>
                        {saving ? <span className="spinner spinner-sm" /> : editingTask ? 'Save Changes' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ───────────────────────────────────────────────────
export default function HabitsPage() {
    const { toast } = useToast();
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, task: null });

    const todayStr = new Date().toISOString().split('T')[0];

    const load = async () => {
        setLoading(true);
        try {
            const r = await habitsAPI.getAll();
            setHabits(r.data.data || []);
        } catch {
            toast('Failed to load tasks', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const toggle = async (id) => {
        // Optimistic update
        setHabits((prev) =>
            prev.map((h) => {
                if (h._id !== id) return h;
                const dates = [...h.completedDates];
                const idx = dates.indexOf(todayStr);
                if (idx > -1) dates.splice(idx, 1);
                else dates.push(todayStr);
                return { ...h, completedDates: dates };
            })
        );
        try {
            await habitsAPI.toggle(id);
        } catch {
            toast('Error updating task', 'error');
            load();
        }
    };

    const del = async (id) => {
        if (!window.confirm('Delete this task permanently?')) return;
        try {
            await habitsAPI.delete(id);
            toast('Task removed', 'success');
            load();
        } catch {
            toast('Error deleting task', 'error');
        }
    };

    const doneCount = habits.filter((h) => h.completedDates.includes(todayStr)).length;
    const pct = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;
    const pending = habits.filter((h) => !h.completedDates.includes(todayStr));
    const completed = habits.filter((h) => h.completedDates.includes(todayStr));

    return (
        <Layout currentPage="Daily Tasks">
            {/* ── Header ── */}
            <div className="page-header">
                <div>
                    <div className="page-title">Daily Tasks</div>
                    <div className="page-subtitle">
                        {format(new Date(), 'EEEE, MMMM do')} · {doneCount} of {habits.length} done
                    </div>
                </div>
            </div>

            {/* ── Progress Card ── */}
            {habits.length > 0 && (
                <div className="card-sm mb-4" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    {/* Circular progress */}
                    <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                        <svg style={{ position: 'absolute', transform: 'rotate(-90deg)', width: 60, height: 60 }}>
                            <circle cx="30" cy="30" r="25" fill="none" stroke="var(--border)" strokeWidth="5" />
                            <circle
                                cx="30" cy="30" r="25" fill="none"
                                stroke="var(--accent)" strokeWidth="5"
                                strokeDasharray={157}
                                strokeDashoffset={157 - (157 * pct) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <span style={{ fontWeight: 800, fontSize: 13, position: 'relative', zIndex: 1 }}>{pct}%</span>
                    </div>
                    {/* Text */}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                            {pct === 100 ? '🎉 All done today!' : pct >= 50 ? '⚡ Keep going!' : '🚀 Let\'s get started!'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
                            {doneCount} completed · {habits.length - doneCount} remaining
                        </div>
                        <div className="progress-bar" style={{ height: 6 }}>
                            <div className="progress-fill" style={{ width: `${pct}%`, background: 'var(--accent)', borderRadius: 4 }} />
                        </div>
                    </div>
                    {/* Streak */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--yellow)', fontWeight: 800, fontSize: 20 }}>
                            <Flame size={18} fill="var(--yellow)" />
                            {Math.max(...habits.map((h) => h.completedDates.length), 0)}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.5px' }}>Best Streak</div>
                    </div>
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <span className="spinner" />
                </div>
            ) : habits.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-emoji">✅</div>
                    <h3>No daily tasks yet</h3>
                    <p>Build a consistent routine by adding your recurring daily activities.</p>
                    <button className="btn btn-primary" onClick={() => setModal({ show: true, task: null })}>
                        <Plus size={14} /> Create First Task
                    </button>
                </div>
            ) : (
                <>
                    {/* Pending tasks */}
                    {pending.length > 0 && (
                        <div className="mb-4">
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8, paddingLeft: 2 }}>
                                Pending · {pending.length}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {pending.map((h) => (
                                    <TaskRow key={h._id} h={h} isDone={false} onToggle={toggle} onEdit={() => setModal({ show: true, task: h })} onDelete={del} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completed tasks */}
                    {completed.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8, paddingLeft: 2 }}>
                                Completed · {completed.length}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {completed.map((h) => (
                                    <TaskRow key={h._id} h={h} isDone={true} onToggle={toggle} onEdit={() => setModal({ show: true, task: h })} onDelete={del} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── Floating Add Button ── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button
                    className="btn btn-primary"
                    onClick={() => setModal({ show: true, task: null })}
                    style={{ borderRadius: 12, padding: '10px 20px', gap: 8, boxShadow: 'var(--shadow-lg)' }}
                >
                    <Plus size={16} /> Add Task
                </button>
            </div>

            {/* ── Modal ── */}
            {modal.show && (
                <TaskModal
                    editingTask={modal.task}
                    onClose={() => setModal({ show: false, task: null })}
                    onSaved={() => { setModal({ show: false, task: null }); load(); }}
                    toast={toast}
                />
            )}
        </Layout>
    );
}

// ── Task Row Component ──────────────────────────────────────────
function TaskRow({ h, isDone, onToggle, onEdit, onDelete }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            opacity: isDone ? 0.6 : 1,
            transition: 'all .2s',
        }}>
            {/* Checkbox */}
            <button
                onClick={() => onToggle(h._id)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0, color: isDone ? 'var(--green)' : 'var(--text3)' }}
            >
                {isDone
                    ? <CheckCircle size={22} fill="var(--green)" strokeWidth={1} color="white" />
                    : <Circle size={22} strokeWidth={1.5} />
                }
            </button>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: isDone ? 'var(--text3)' : 'var(--text)',
                    textDecoration: isDone ? 'line-through' : 'none',
                    transition: 'all .2s',
                }}>
                    {h.name}
                </div>
                {h.description && (
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1, textDecoration: isDone ? 'line-through' : 'none' }}>
                        {h.description}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-1">
                <button className="btn btn-ghost btn-icon-sm" onClick={onEdit} title="Edit"><Edit2 size={13} /></button>
                <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => onDelete(h._id)} title="Delete"><Trash2 size={13} /></button>
            </div>
        </div>
    );
}
