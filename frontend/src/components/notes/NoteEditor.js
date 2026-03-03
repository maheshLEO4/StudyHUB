import React, { useState, useRef, useEffect } from "react";
import { Bold, Italic, Underline, List, Code, Upload, X, Star, Paperclip } from "lucide-react";
import { notesAPI } from "../../utils/api";

const API_BASE = process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function NoteEditor({ note, subjectId, onClose, onSaved }) {
  const [form, setForm] = useState({ title: note?.title || "", is_important: note?.is_important || false, tags: note?.tags || [], file_urls: note?.file_urls || [] });
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && note?.content) editorRef.current.innerHTML = note.content;
  }, []);

  const exec = (cmd, val = null) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };

  const removeTag = (t) => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await notesAPI.uploadFile(fd);
      const url = `${API_BASE}${r.data.data.file_url}`;
      setForm(f => ({ ...f, file_urls: [...f.file_urls, url] }));
    } catch { alert("File upload failed"); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const removeFile = (url) => setForm(f => ({ ...f, file_urls: f.file_urls.filter(u => u !== url) }));

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const content = editorRef.current?.innerHTML || "";
      const payload = { ...form, content, subject: subjectId };
      if (note) await notesAPI.update(note._id, payload);
      else await notesAPI.create(payload);
      onSaved();
    } catch (e) { alert(e.response?.data?.message || "Error saving note"); }
    finally { setSaving(false); }
  };

  const isImage = url => /\.(jpg|jpeg|png|gif|webp)/i.test(url);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxHeight: "92vh" }}>
        <div className="modal-header">
          <span className="modal-title">{note ? "Edit Note" : "New Note"}</span>
          <div className="flex gap-2 items-center">
            <button className="btn btn-ghost btn-icon" title="Mark as important" onClick={() => setForm(f => ({ ...f, is_important: !f.is_important }))} style={{ color: form.is_important ? "var(--warning)" : "var(--text3)" }}>
              <Star size={16} fill={form.is_important ? "var(--warning)" : "none"} />
            </button>
            <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-control" placeholder="Note title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Content</label>
          <div className="editor-toolbar">
            <button onMouseDown={e => { e.preventDefault(); exec("bold"); }} title="Bold"><b>B</b></button>
            <button onMouseDown={e => { e.preventDefault(); exec("italic"); }} title="Italic"><i>I</i></button>
            <button onMouseDown={e => { e.preventDefault(); exec("underline"); }} title="Underline"><u>U</u></button>
            <div className="toolbar-sep" />
            <button onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }} title="Bullet list">• List</button>
            <button onMouseDown={e => { e.preventDefault(); exec("insertOrderedList"); }} title="Numbered list">1. List</button>
            <div className="toolbar-sep" />
            <button onMouseDown={e => { e.preventDefault(); exec("formatBlock", "h2"); }} title="Heading">H2</button>
            <button onMouseDown={e => { e.preventDefault(); exec("formatBlock", "blockquote"); }} title="Quote">❝</button>
            <button onMouseDown={e => { e.preventDefault(); exec("formatBlock", "pre"); }} title="Code">{"</>"}</button>
          </div>
          <div ref={editorRef} className="editor-area" contentEditable suppressContentEditableWarning onInput={() => {}} style={{ minHeight: 160 }} />
        </div>

        {/* Tags */}
        <div className="form-group mt-4">
          <label className="form-label">Tags</label>
          <div className="flex gap-2">
            <input className="form-control" placeholder="Add a tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} style={{ flex: 1 }} />
            <button className="btn btn-secondary btn-sm" onClick={addTag}>Add</button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {form.tags.map(t => (
                <span key={t} className="badge badge-purple" style={{ cursor: "pointer" }} onClick={() => removeTag(t)}>#{t} ✕</span>
              ))}
            </div>
          )}
        </div>

        {/* File attachments */}
        <div className="form-group">
          <label className="form-label">Attachments</label>
          <div className="flex gap-2 items-center">
            <button className="btn btn-ghost btn-sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload size={13} /> {uploading ? "Uploading..." : "Upload File"}
            </button>
            <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} />
          </div>
          {form.file_urls.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {form.file_urls.map(url => (
                <div key={url} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <Paperclip size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, flex: 1, color: "var(--accent)" }} className="truncate">{url.split("/").pop()}</a>
                  <button className="btn btn-ghost btn-icon-sm" onClick={() => removeFile(url)} style={{ color: "var(--danger)" }}><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving || !form.title.trim()}>
            {saving ? <span className="spinner spinner-sm" /> : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}