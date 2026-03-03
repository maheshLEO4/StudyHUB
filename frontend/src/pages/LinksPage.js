import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Link2, ExternalLink, Search } from "lucide-react";
import Layout from "../components/layout/Layout";
import { linksAPI } from "../utils/api";
import { useToast } from "../context/ToastContext";

const CATEGORIES = ["All","DSA Problems","YouTube","Articles","Coding Platforms","Documentation","Other"];
const CAT_BADGES = { "DSA Problems":"badge-purple","YouTube":"badge-red","Articles":"badge-blue","Coding Platforms":"badge-green","Documentation":"badge-gray","Other":"badge-gray" };

function LinkModal({ link, onClose, onSaved, toast }) {
  const [form, setForm] = useState({ title: link?.title || "", url: link?.url || "", description: link?.description || "", category: link?.category || "Other", tags: link?.tags?.join(", ") || "" });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title.trim() || !form.url.trim()) return toast("Title and URL required", "error");
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
      if (link) await linksAPI.update(link._id, payload);
      else await linksAPI.create(payload);
      toast(link ? "Link updated" : "Link saved", "success"); onSaved();
    } catch { toast("Error", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{link ? "Edit Link" : "Save Link"}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-group"><label className="form-label">Title</label>
          <input className="form-control" placeholder="Link title..." value={form.title} onChange={set("title")} />
        </div>
        <div className="form-group"><label className="form-label">URL</label>
          <input className="form-control" placeholder="https://..." value={form.url} onChange={set("url")} />
        </div>
        <div className="form-group"><label className="form-label">Description</label>
          <textarea className="form-control" placeholder="What is this link about?" value={form.description} onChange={set("description")} style={{ minHeight: 70 }} />
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Category</label>
            <select className="form-control" value={form.category} onChange={set("category")}>
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Tags (comma-separated)</label>
            <input className="form-control" placeholder="dp, graph, important..." value={form.tags} onChange={set("tags")} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : "Save Link"}</button>
        </div>
      </div>
    </div>
  );
}

export default function LinksPage() {
  const { toast } = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editLink, setEditLink] = useState(null);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== "All") params.category = category;
      if (search.trim()) params.search = search.trim();
      const r = await linksAPI.getAll(params);
      setLinks(r.data.data || []);
    } catch { toast("Failed to load links", "error"); }
    finally { setLoading(false); }
  }, [category, search]);

  useEffect(() => {
    const t = setTimeout(loadLinks, 300);
    return () => clearTimeout(t);
  }, [loadLinks]);

  const deleteLink = async (id) => {
    try { await linksAPI.delete(id); toast("Link deleted", "success"); loadLinks(); }
    catch { toast("Error", "error"); }
  };

  return (
    <Layout currentPage="Links">
      <div className="section-header">
        <div>
          <div className="section-title">Important Links</div>
          <div className="section-subtitle">{links.length} saved resource{links.length !== 1 ? "s" : ""}</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditLink(null); setShowModal(true); }}><Plus size={15} /> Save Link</button>
      </div>

      {/* Search + Category filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ color: "var(--text3)", flexShrink: 0 }} />
          <input placeholder="Search links..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {CATEGORIES.map(c => <span key={c} className={`tag ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</span>)}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : links.length === 0 ? (
        <div className="empty-state"><Link2 size={40} /><h3>No links found</h3><p>Save important URLs and resources for quick access</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {links.map(l => (
            <div key={l._id} className="link-card">
              <div className="link-icon"><Link2 size={18} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{l.title}</span>
                  <span className={`badge ${CAT_BADGES[l.category] || "badge-gray"}`}>{l.category}</span>
                </div>
                <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--accent)" }} className="truncate" style={{ display: "block", fontSize: 12, color: "var(--accent)" }}>{l.url}</a>
                {l.description && <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 3 }}>{l.description}</div>}
                {l.tags?.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {l.tags.map(t => <span key={t} className="badge badge-gray">#{t}</span>)}
                  </div>
                )}
              </div>
              <div className="flex gap-1" style={{ flexShrink: 0 }}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-icon-sm" title="Open link"><ExternalLink size={13} /></a>
                <button className="btn btn-ghost btn-icon-sm" onClick={() => { setEditLink(l); setShowModal(true); }}><Edit2 size={13} /></button>
                <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => deleteLink(l._id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <LinkModal link={editLink} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadLinks(); }} toast={toast} />}
    </Layout>
  );
}