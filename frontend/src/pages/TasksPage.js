import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, CheckCircle, Circle } from "lucide-react";
import Layout from "../components/layout/Layout";
import { tasksAPI } from "../utils/api";
import { useToast } from "../context/ToastContext";
import { format } from "date-fns";

function TaskModal({ task, onClose, onSaved, toast }) {
  const [form, setForm] = useState({ title: task?.title || "", checklist_name: task?.checklist_name || "General", priority: task?.priority || "Medium", due_date: task?.due_date ? task.due_date.slice(0, 10) : "" });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) return toast("Task title required", "error");
    setSaving(true);
    try {
      if (task) await tasksAPI.update(task._id, form);
      else await tasksAPI.create(form);
      toast(task ? "Task updated" : "Task created", "success"); onSaved();
    } catch { toast("Error", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{task ? "Edit Task" : "Add Task"}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-group"><label className="form-label">Task</label>
          <input className="form-control" placeholder="What needs to be done?" value={form.title} onChange={set("title")} onKeyDown={e => e.key === "Enter" && save()} />
        </div>
        <div className="form-group"><label className="form-label">Checklist / Category</label>
          <input className="form-control" placeholder="e.g. Week 1, Assignments, Reading..." value={form.checklist_name} onChange={set("checklist_name")} />
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Priority</label>
            <select className="form-control" value={form.priority} onChange={set("priority")}>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div className="form-group"><label className="form-label">Due Date</label>
            <input className="form-control" type="date" value={form.due_date} onChange={set("due_date")} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChecklist, setFilterChecklist] = useState("All");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== "all") params.completed = filterStatus === "completed";
      const r = await tasksAPI.getAll(params);
      setTasks(r.data.data || []);
    } catch { toast("Failed to load tasks", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadTasks(); }, [filterStatus]);

  const toggle = async (id) => {
    try { await tasksAPI.toggle(id); loadTasks(); }
    catch { toast("Error", "error"); }
  };

  const deleteTask = async (id) => {
    try { await tasksAPI.delete(id); toast("Task deleted", "success"); loadTasks(); }
    catch { toast("Error", "error"); }
  };

  const checklists = ["All", ...new Set(tasks.map(t => t.checklist_name).filter(Boolean))];
  const filtered = filterChecklist === "All" ? tasks : tasks.filter(t => t.checklist_name === filterChecklist);

  const grouped = filtered.reduce((acc, t) => {
    const key = t.checklist_name || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <Layout currentPage="Tasks">
      <div className="section-header">
        <div>
          <div className="section-title">Tasks</div>
          <div className="section-subtitle">{tasks.filter(t => !t.completed).length} pending · {tasks.filter(t => t.completed).length} completed</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTask(null); setShowModal(true); }}><Plus size={15} /> Add Task</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="tabs" style={{ width: "auto" }}>
          {["pending", "completed", "all"].map(s => (
            <button key={s} className={`tab-btn ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(s)} style={{ textTransform: "capitalize" }}>{s === "all" ? "All" : s === "pending" ? "Pending" : "Completed"}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 'auto' }}>
          {checklists.map(c => (
            <span key={c} className={`tag ${filterChecklist === c ? "active" : ""}`} onClick={() => setFilterChecklist(c)}>{c}</span>
          ))}
        </div>
      </div>

      {loading ? <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><span className="spinner" /></div>
        : filtered.length === 0 ? (
          <div className="empty-state"><CheckCircle size={40} /><h3>No tasks found</h3><p>Add some tasks to stay organized</p></div>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="mb-6">
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8, paddingLeft: 2 }}>{group}</div>
              {items.map(t => (
                <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", marginBottom: 6, opacity: t.completed ? .6 : 1, transition: "all .2s" }}>
                  <button className="btn btn-ghost btn-icon-sm" onClick={() => toggle(t._id)} style={{ color: t.completed ? "var(--success)" : "var(--border)", padding: 0 }}>
                    {t.completed ? <CheckCircle size={20} fill="var(--success)" /> : <Circle size={20} />}
                  </button>
                  <div className={`priority-dot priority-${t.priority}`} title={t.priority} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13.5, textDecoration: t.completed ? "line-through" : "none", color: t.completed ? "var(--text3)" : "var(--text)" }}>{t.title}</div>
                    {t.due_date && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>Due {format(new Date(t.due_date), "MMM d, yyyy")}</div>}
                  </div>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-icon-sm" onClick={() => { setEditTask(t); setShowModal(true); }}><Edit2 size={12} /></button>
                    <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => deleteTask(t._id)}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

      {showModal && <TaskModal task={editTask} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadTasks(); }} toast={toast} />}
    </Layout>
  );
}