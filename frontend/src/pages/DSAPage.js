import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, ExternalLink, Code2 } from "lucide-react";
import Layout from "../components/layout/Layout";
import { dsaAPI } from "../utils/api";
import { useToast } from "../context/ToastContext";

const STATUS_CYCLE = { 'Not Started': 'In Progress', 'In Progress': ' Completed', 'Completed': 'Not Started' };
const DIFF_BADGE = { Easy: "badge-green", Medium: "badge-yellow", Hard: "badge-red" };
const STATUS_BADGE = { "Not Started": "badge-gray", "In Progress": "badge-yellow", "Completed": "badge-green" };

function DSAModal({ problem, onClose, onSaved, toast }) {
  const [form, setForm] = useState({ title: problem?.title || "", url: problem?.url || "", difficulty: problem?.difficulty || "Medium", topic: problem?.topic || "", status: problem?.status || "Not Started", notes: problem?.notes || "" });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) return toast("Problem title required", "error");
    setSaving(true);
    try {
      if (problem) await dsaAPI.update(problem._id, form);
      else await dsaAPI.create(form);
      toast('Problem saved', 'success'); onSaved();
    } catch { toast('Error saving problem', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{problem ? "Edit Problem" : "Add Problem"}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-group"><label className="form-label">Problem Title</label>
          <input className="form-control" placeholder="e.g. Two Sum, Longest Substring..." value={form.title} onChange={set("title")} />
        </div>
        <div className="form-group"><label className="form-label">URL (optional)</label>
          <input className="form-control" placeholder="https://leetcode.com/problems/..." value={form.url} onChange={set("url")} />
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Topic</label>
            <input className="form-control" placeholder="e.g. Arrays, DP, Graphs..." value={form.topic} onChange={set("topic")} />
          </div>
          <div className="form-group"><label className="form-label">Difficulty</label>
            <select className="form-control" value={form.difficulty} onChange={set("difficulty")}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Status</label>
          <select className="form-control" value={form.status} onChange={set("status")}>
            <option>Not Started</option><option>In Progress</option><option>Completed</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Notes</label>
          <textarea className="form-control" placeholder="Approach, complexity, key insights..." value={form.notes} onChange={set("notes")} style={{ minHeight: 80 }} />
        </div>
      </div>
    </div>
  );
}

export default function DSAPage() {
  const { toast } = useToast();
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProblem, setEditProblem] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== "All") params.status = filterStatus;
      if (filterDiff !== "All") params.difficulty = filterDiff;
      if (search.trim()) params.search = search;
      const [p, s] = await Promise.all([dsaAPI.getAll(params), dsaAPI.getStats()]);
      setProblems(p.data.data || []);
      setStats(s.data.data || null);
    } catch { toast('Failed to load tracking data', 'error'); }
    finally { setLoading(false); }
  }, [filterStatus, filterDiff, search]);

  useEffect(() => {
    const t = setTimeout(loadData, 300);
    return () => clearTimeout(t);
  }, [loadData]);

  const cycleStatus = async (p, newStatus) => {
    try {
      const updatedStatus = newStatus || STATUS_CYCLE[p.status];
      await dsaAPI.update(p._id, { status: updatedStatus });
      loadData();
    }
    catch { toast("Error", "error"); }
  };

  const deleteProblem = async (id) => {
    try { await dsaAPI.delete(id); toast("Problem deleted", "success"); loadData(); }
    catch { toast("Error", "error"); }
  };

  return (
    <Layout currentPage="DSA Tracker">
      <div className="page-header">
        <div>
          <div className="page-title">DSA Problem Tracker</div>
          <div className="page-subtitle">{stats ? `${stats.completed}/${stats.total} solved` : 'Track your coding practice'}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setEditProblem(null); setShowModal(true); }}><Plus size={15} /> Add Problem</button>
        </div>
      </div>
      {/* Stats bar */}
      {stats && stats.total > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Progress</span>
            <span className="badge badge-purple">{Math.round((stats.completed / stats.total) * 100)}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(stats.completed / stats.total) * 100}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 6, transition: 'width .6s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12.5, fontWeight: 500 }}>
            <span style={{ color: 'var(--text3)' }}>⬜ Not Started: {stats.notStarted}</span>
            <span style={{ color: 'var(--yellow)' }}>🟡 In Progress: {stats.inProgress}</span>
            <span style={{ color: 'var(--green)' }}>🟢 Completed: {stats.completed}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
              <span style={{ color: 'var(--green)' }}>Easy: {stats.easy}</span>
              <span style={{ color: 'var(--yellow)' }}>Medium: {stats.medium}</span>
              <span style={{ color: 'var(--red)' }}>Hard: {stats.hard}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Code2 size={14} style={{ color: "var(--text3)", flexShrink: 0 }} />
          <input placeholder="Search problems or topics..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-control" style={{ width: "auto" }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option>Not Started</option><option>In Progress</option><option>Completed</option>
        </select>
        <select className="form-control" style={{ width: "auto" }} value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
          <option value="All">All Difficulty</option>
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><span className="spinner" /></div>
      ) : problems.length === 0 ? (
        <div className="empty-state"><Code2 size={40} /><h3>No problems found</h3><p>Start adding DSA problems to track your practice</p></div>
      ) : (
        problems.map(p => (
          <div key={p._id} className="dsa-row">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</span>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon-sm" style={{ padding: 2, height: 'auto', border: 'none' }}>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge ${DIFF_BADGE[p.difficulty]}`} style={{ fontSize: '10px' }}>{p.difficulty}</span>
                {p.topic && <span className="badge badge-gray" style={{ fontSize: '10px' }}>{p.topic}</span>}
              </div>
            </div>
            <div className="flex gap-2 items-center" style={{ flexShrink: 0 }}>
              <select
                className="form-control"
                style={{ width: 'auto', height: 28, padding: '0 8px', fontSize: 11.5, borderRadius: 6, cursor: 'pointer', background: 'var(--surface2)', borderColor: 'var(--border)' }}
                value={p.status}
                onChange={(e) => cycleStatus(p, e.target.value)}
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
              <button className="btn btn-ghost btn-icon-sm" onClick={() => { setEditProblem(p); setShowModal(true); }} style={{ height: 28, width: 28 }}><Edit2 size={13} /></button>
              <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => deleteProblem(p._id)} style={{ height: 28, width: 28 }}><Trash2 size={13} /></button>
            </div>
          </div>
        ))
      )}

      {showModal && <DSAModal problem={editProblem} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadData(); }} toast={toast} />}
    </Layout>
  );
}