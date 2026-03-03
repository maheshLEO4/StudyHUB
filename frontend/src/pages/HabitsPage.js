import React, { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, Circle, Flame, Zap } from "lucide-react";
import Layout from "../components/layout/Layout";
import { habitsAPI } from "../utils/api";
import { useToast } from "../context/ToastContext";

function HabitModal({ onClose, onSaved, toast }) {
    const [form, setForm] = useState({ name: "", description: "", icon: "⭐" });
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!form.name.trim()) return toast("Habit name required", "error");
        setSaving(true);
        try {
            await habitsAPI.create(form);
            toast("Habit created", "success");
            onSaved();
        } catch {
            toast("Error creating habit", "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <span className="modal-title">New Habit</span>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>
                <div className="form-group">
                    <label className="form-label">Habit Name</label>
                    <input className="form-control" placeholder="e.g. Read for 30 mins, Exercise..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Goal / Description</label>
                    <input className="form-control" placeholder="Optional details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : "Create"}</button>
                </div>
            </div>
        </div>
    );
}

export default function HabitsPage() {
    const { toast } = useToast();
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const loadHabits = async () => {
        setLoading(true);
        try {
            const r = await habitsAPI.getAll();
            setHabits(r.data.data || []);
        } catch {
            toast("Failed to load habits", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadHabits(); }, []);

    const toggleHabit = async (id) => {
        try {
            await habitsAPI.toggle(id);
            loadHabits();
        } catch {
            toast("Error updating habit", "error");
        }
    };

    const deleteHabit = async (id) => {
        if (!window.confirm("Delete this habit?")) return;
        try {
            await habitsAPI.delete(id);
            toast("Habit deleted", "success");
            loadHabits();
        } catch {
            toast("Error deleting habit", "error");
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <Layout currentPage="Daily Habits">
            <div className="section-header">
                <div>
                    <div className="section-title">Daily Habits</div>
                    <div className="section-subtitle">Track your daily discipline. Resets at midnight.</div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> New Habit</button>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><span className="spinner" /></div>
            ) : habits.length === 0 ? (
                <div className="empty-state">
                    <Flame size={40} style={{ color: "var(--warning)", opacity: 0.5 }} />
                    <h3>No habits yet</h3>
                    <p>Start tracking daily activities to build a streak</p>
                </div>
            ) : (
                <div className="grid-2">
                    {habits.map((h) => {
                        const isCompletedToday = h.completedDates.includes(todayStr);
                        return (
                            <div key={h._id} className="card" style={{ display: "flex", alignItems: "center", gap: 15, borderLeft: isCompletedToday ? "4px solid var(--success)" : "4px solid var(--border)" }}>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    style={{ color: isCompletedToday ? "var(--success)" : "var(--border)", padding: 0 }}
                                    onClick={() => toggleHabit(h._id)}
                                >
                                    {isCompletedToday ? <CheckCircle size={32} fill="var(--success)" color="white" /> : <Circle size={32} />}
                                </button>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 16, color: isCompletedToday ? "var(--text3)" : "var(--text)" }}>{h.name}</div>
                                    {h.description && <div style={{ fontSize: 12, color: "var(--text2)" }}>{h.description}</div>}
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 12, color: "var(--warning)", fontWeight: 700 }}>
                                        <Zap size={12} fill="var(--warning)" /> {h.completedDates.length} total completions
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => deleteHabit(h._id)}><Trash2 size={15} /></button>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && <HabitModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadHabits(); }} toast={toast} />}
        </Layout>
    );
}
