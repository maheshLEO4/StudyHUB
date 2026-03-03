import React, { useState, useEffect, useCallback } from 'react';
import { linksAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import Icon from '../shared/Icon';
import Modal from '../shared/Modal';
import EmptyState from '../shared/EmptyState';
import Spinner from '../shared/Spinner';

const CATEGORIES = ['All','DSA Problems','YouTube','Articles','Coding Platforms','Documentation','Research','Other'];
const CAT_BADGE = { 'DSA Problems':'badge-purple','YouTube':'badge-red','Articles':'badge-blue','Coding Platforms':'badge-green','Documentation':'badge-accent','Research':'badge-yellow','Other':'badge-gray' };

const LinksPage = () => {
  const [links, setLinks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cat, setCat]           = useState('All');
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm] = useState({ title: '', url: '', description: '', category: 'Other', tags: '' });
  const { execute, loading: saving } = useApi();
  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (cat !== 'All') params.category = cat;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await linksAPI.getAll(params);
      setLinks(data.data);
    } finally { setLoading(false); }
  }, [cat, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm({ title:'',url:'',description:'',category:'Other',tags:'' }); setEditing(null); setShowModal(true); };
  const openEdit = (l) => { setForm({ title:l.title,url:l.url,description:l.description||'',category:l.category,tags:(l.tags||[]).join(', ') }); setEditing(l); setShowModal(true); };

  const saveLink = async () => {
    if (!form.title.trim() || !form.url.trim()) return;
    const payload = { ...form, tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean) };
    if (editing) {
      const r = await execute(() => linksAPI.update(editing._id, payload), { successMsg: 'Link updated' });
      setLinks(prev => prev.map(l => l._id === editing._id ? r : l));
    } else {
      const r = await execute(() => linksAPI.create(payload), { successMsg: 'Link saved' });
      setLinks(prev => [r, ...prev]);
    }
    setShowModal(false);
  };

  const deleteLink = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    await execute(() => linksAPI.delete(id), { successMsg: 'Link deleted' });
    setLinks(prev => prev.filter(l => l._id !== id));
  };

  const toggleFav = async (l) => {
    const r = await execute(() => linksAPI.update(l._id, { isFavorite: !l.isFavorite }));
    setLinks(prev => prev.map(x => x._id === l._id ? r : x));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Important Links</div>
          <div className="page-subtitle">{links.length} saved</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}><Icon name="plus" size={15}/>Add Link</button>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="search-bar flex-1" style={{ maxWidth: 360 }}>
          <Icon name="search" size={15} />
          <input placeholder="Search links..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>

      <div className="tags mb-4">
        {CATEGORIES.map(c=>(
          <span key={c} className={`tag ${cat===c?'tag--active':''}`} onClick={()=>setCat(c)}>{c}</span>
        ))}
      </div>

      {loading ? <div style={{textAlign:'center',paddingTop:40}}><Spinner size={28}/></div>
        : links.length===0 ? <EmptyState emoji="🔗" title="No links found" description="Save important URLs for quick access" action={<button className="btn btn-primary" onClick={openAdd}><Icon name="plus" size={14}/>Add Link</button>}/>
        : <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {links.map(l=>(
              <div key={l._id} className="link-item">
                <div className="link-favicon"><Icon name="link" size={16}/></div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span style={{fontWeight:700,fontSize:14}}>{l.title}</span>
                    <span className={`badge ${CAT_BADGE[l.category]||'badge-gray'}`}>{l.category}</span>
                    {l.isFavorite && <span className="badge badge-yellow">★ Fav</span>}
                  </div>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" style={{color:'var(--blue)',fontSize:12,display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.url}</a>
                  {l.description && <div className="text-sm text-muted mt-1">{l.description}</div>}
                  {l.tags?.length>0 && <div className="flex gap-1 mt-2 flex-wrap">{l.tags.map(t=><span key={t} className="badge badge-gray">#{t}</span>)}</div>}
                </div>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>toggleFav(l)} title={l.isFavorite?'Unfavorite':'Favorite'}><Icon name="star" size={13}/></button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>openEdit(l)}><Icon name="edit" size={13}/></button>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={()=>deleteLink(l._id)}><Icon name="trash" size={13}/></button>
                </div>
              </div>
            ))}
          </div>
      }

      {showModal && (
        <Modal title={editing?'Edit Link':'Add Link'} onClose={()=>setShowModal(false)}>
          <div className="form-group"><label className="form-label">Title *</label><input className="form-control" placeholder="e.g. LeetCode - Two Sum" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} autoFocus/></div>
          <div className="form-group"><label className="form-label">URL *</label><input className="form-control" placeholder="https://..." value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Description</label><input className="form-control" placeholder="Brief description..." value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Category</label><select className="form-control" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATEGORIES.filter(c=>c!=='All').map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Tags (comma-separated)</label><input className="form-control" placeholder="dp, graph, medium" value={form.tags} onChange={e=>setForm(f=>({...f,tags:e.target.value}))}/></div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={()=>setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveLink} disabled={saving}>{saving?<Spinner size={15}/>:'Save Link'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default LinksPage;
