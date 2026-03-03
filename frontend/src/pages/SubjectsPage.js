import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, ChevronLeft, FileText, Star, Folder } from "lucide-react";
import Layout from "../components/layout/Layout";
import NoteEditor from "../components/notes/NoteEditor";
import { subjectsAPI, notesAPI } from "../utils/api";
import { useToast } from "../context/ToastContext";
import { format } from "date-fns";

const COLORS = ["#6c63ff","#ef4444","#f59e0b","#22c55e","#3b82f6","#ec4899","#14b8a6","#f97316","#8b5cf6","#06b6d4"];
const ICONS  = ["📚","🔬","🧮","💻","📐","📝","🎨","🌍","⚗️","🎵","📊","🏛️"];

function SubjectModal({ subject, onClose, onSaved, toast }) {
  const [form, setForm] = useState({ name: subject?.name || "", description: subject?.description || "", color: subject?.color || COLORS[0], icon: subject?.icon || "📚" });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.name.trim()) return toast("Subject name required", "error");
    setSaving(true);
    try {
      if (subject) await subjectsAPI.update(subject._id, form);
      else await subjectsAPI.create(form);
      toast(subject ? "Subject updated" : "Subject created", "success");
      onSaved();
    } catch (e) { toast(e.response?.data?.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{subject ? "Edit Subject" : "New Subject"}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-group"><label className="form-label">Subject Name</label>
          <input className="form-control" placeholder="e.g. Data Structures & Algorithms" value={form.name} onChange={set("name")} />
        </div>
        <div className="form-group"><label className="form-label">Description</label>
          <textarea className="form-control" placeholder="Brief description..." value={form.description} onChange={set("description")} style={{ minHeight: 70 }} />
        </div>
        <div className="form-group"><label className="form-label">Icon</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ICONS.map(ic => (
              <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))} style={{ fontSize: 20, background: form.icon === ic ? "var(--accent-light)" : "var(--surface2)", border: `2px solid ${form.icon === ic ? "var(--accent)" : "transparent"}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>{ic}</button>
            ))}
          </div>
        </div>
        <div className="form-group"><label className="form-label">Color</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: form.color === c ? "3px solid var(--text)" : "3px solid transparent", transition: "border .15s" }} />
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : "Save Subject"}</button>
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete }) {
  return (
    <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px", marginBottom: 8, borderLeft: note.is_important ? "3px solid var(--warning)" : undefined }}>
      <div className="flex items-center justify-between mb-1">
        <div style={{ fontWeight: 600, fontSize: 14 }}>{note.is_important && "⭐ "}{note.title}</div>
        <div className="flex gap-1">
          <button className="btn btn-ghost btn-icon-sm" onClick={() => onEdit(note)}><Edit2 size={12} /></button>
          <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => onDelete(note._id)}><Trash2 size={12} /></button>
        </div>
      </div>
      <div className="line-clamp-2" style={{ fontSize: 13, color: "var(--text2)" }} dangerouslySetInnerHTML={{ __html: note.content }} />
      {note.tags?.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {note.tags.map(t => <span key={t} className="badge badge-gray">#{t}</span>)}
        </div>
      )}
      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>{format(new Date(note.createdAt), "MMM d, yyyy")}</div>
    </div>
  );
}

function SubjectDetail({ subject, onBack, toast }) {
  const [notes, setNotes] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const loadNotes = async () => {
    setLoading(true);
    try { const r = await notesAPI.getAll({ subject: subject._id }); setNotes(r.data.data || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadNotes(); }, [subject._id]);

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try { await notesAPI.delete(id); toast("Note deleted", "success"); loadNotes(); }
    catch { toast("Error deleting note", "error"); }
  };

  const filtered = tab === "important" ? notes.filter(n => n.is_important) : notes;

  return (
    <div>
      <div className="section-header">
        <div className="flex items-center gap-3">
          <button className="btn btn-ghost btn-sm" onClick={onBack}><ChevronLeft size={15} /> Back</button>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: subject.color }} />
          <div>
            <div className="section-title">{subject.icon} {subject.name}</div>
            {subject.description && <div className="section-subtitle">{subject.description}</div>}
          </div>
        </div>
        <div className="section-actions">
          <button className="btn btn-primary" onClick={() => { setEditingNote(null); setShowEditor(true); }}><Plus size={15} /> Add Note</button>
        </div>
      </div>

      <div className="tabs mb-6" style={{ maxWidth: 360 }}>
        <button className={`tab-btn ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>All Notes ({notes.length})</button>
        <button className={`tab-btn ${tab === "important" ? "active" : ""}`} onClick={() => setTab("important")}>⭐ Important ({notes.filter(n => n.is_important).length})</button>
      </div>

      {loading ? <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><span className="spinner" /></div>
        : filtered.length === 0 ? (
          <div className="empty-state"><FileText size={40} /><h3>No notes {tab === "important" ? "marked as important" : "yet"}</h3><p>Click "Add Note" to create your first note</p></div>
        ) : filtered.map(n => (
          <NoteCard key={n._id} note={n} onEdit={note => { setEditingNote(note); setShowEditor(true); }} onDelete={deleteNote} />
        ))}

      {showEditor && (
        <NoteEditor note={editingNote} subjectId={subject._id} onClose={() => setShowEditor(false)} onSaved={() => { setShowEditor(false); loadNotes(); toast(editingNote ? "Note updated" : "Note created", "success"); }} />
      )}
    </div>
  );
}

export default function SubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const loadSubjects = async () => {
    setLoading(true);
    try { const r = await subjectsAPI.getAll(); setSubjects(r.data.data || []); }
    catch { toast("Failed to load subjects", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSubjects(); }, []);

  const deleteSubject = async (id) => {
    if (!window.confirm("Delete this subject and ALL its notes?")) return;
    try { await subjectsAPI.delete(id); toast("Subject deleted", "success"); loadSubjects(); }
    catch { toast("Error", "error"); }
  };

  if (selectedSubject) return (
    <Layout currentPage={selectedSubject.name}>
      <SubjectDetail subject={selectedSubject} onBack={() => setSelectedSubject(null)} toast={toast} />
    </Layout>
  );

  return (
    <Layout currentPage="Subjects">
      <div className="section-header">
        <div>
          <div className="section-title">Subjects</div>
          <div className="section-subtitle">{subjects.length} subject{subjects.length !== 1 ? "s" : ""}</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditSubject(null); setShowModal(true); }}><Plus size={15} /> Add Subject</button>
      </div>

      {loading ? (
        <div className="grid-3">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="empty-state"><Folder size={48} /><h3>No subjects yet</h3><p>Create your first subject to start organizing study materials</p><button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowModal(true)}><Plus size={15} /> Create Subject</button></div>
      ) : (
        <div className="grid-3">
          {subjects.map(s => (
            <div key={s._id} className="subject-card" style={{ "--subject-color": s.color }} onClick={() => setSelectedSubject(s)}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-ghost btn-icon-sm" onClick={() => { setEditSubject(s); setShowModal(true); }}><Edit2 size={13} /></button>
                  <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => deleteSubject(s._id)}><Trash2 size={13} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{s.name}</div>
              {s.description && <div className="line-clamp-2" style={{ fontSize: 12.5, color: "var(--text2)", marginBottom: 8 }}>{s.description}</div>}
              <div style={{ fontSize: 12, color: "var(--text3)", display: "flex", gap: 12 }}>
                <span><FileText size={11} style={{ display: "inline", marginRight: 3 }} />{s.noteCount || 0} notes</span>
                <span style={{ color: s.color, marginLeft: "auto" }}>Open →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <SubjectModal subject={editSubject} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadSubjects(); }} toast={toast} />}
    </Layout>
  );
}