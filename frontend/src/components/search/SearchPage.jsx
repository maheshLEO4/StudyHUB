import React, { useState, useEffect } from 'react';
import { searchAPI } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import Icon from '../shared/Icon';
import Spinner from '../shared/Spinner';

const TYPE_COLORS = { Subject:'var(--blue)',Note:'var(--green)',Link:'var(--accent)',Problem:'var(--purple)',Task:'var(--yellow)' };

const SearchPage = () => {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const debounced = useDebounce(query, 350);

  useEffect(() => {
    if (!debounced?.trim()) { setResults(null); return; }
    setLoading(true);
    searchAPI.search(debounced)
      .then(({ data }) => setResults(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debounced]);

  const Section = ({ type, items, renderItem }) => {
    if (!items?.length) return null;
    return (
      <div style={{marginBottom:24}}>
        <div className="text-xs font-bold text-muted mb-2" style={{textTransform:'uppercase',letterSpacing:'.7px',color:TYPE_COLORS[type]}}>{type}s ({items.length})</div>
        {items.map((item, i) => renderItem(item, i))}
      </div>
    );
  };

  const totalCount = results ? Object.values(results).reduce((a,b)=>a+(Array.isArray(b)?b.length:0),0) : 0;

  return (
    <div>
      <div className="page-header"><div className="page-title">Search</div></div>

      <div className="search-bar mb-6" style={{maxWidth:600,height:48}}>
        <Icon name="search" size={18}/>
        <input placeholder="Search subjects, notes, links, problems, tasks..." value={query} onChange={e=>setQuery(e.target.value)} style={{fontSize:15}} autoFocus/>
        {query&&<button className="btn btn-ghost btn-sm btn-icon" onClick={()=>setQuery('')}><Icon name="x" size={14}/></button>}
      </div>

      {loading && <div style={{textAlign:'center',paddingTop:40}}><Spinner size={28}/></div>}

      {results && !loading && (
        <>
          <div className="text-sm text-muted mb-4">{totalCount} result{totalCount!==1?'s':''} for "{debounced}"</div>
          {totalCount===0 && <div style={{textAlign:'center',padding:'48px 0',color:'var(--text3)'}}>No results found. Try different keywords.</div>}

          <Section type="Subject" items={results.subjects} renderItem={(s,i)=>(
            <div key={i} className="card-sm mb-2" style={{borderLeft:`3px solid ${s.color}`}}>
              <div style={{fontWeight:700}}>{s.name}</div>
              {s.description&&<div className="text-sm text-muted">{s.description}</div>}
            </div>
          )}/>
          <Section type="Note" items={results.notes} renderItem={(n,i)=>(
            <div key={i} className="card-sm mb-2" style={{borderLeft:`3px solid ${n.subjectColor||'var(--green)'}`}}>
              <div className="text-xs text-muted mb-1">{n.subjectName}</div>
              <div style={{fontWeight:700}}>{n.title}</div>
              {n.content&&<div className="text-sm text-muted" style={{overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{n.content}</div>}
            </div>
          )}/>
          <Section type="Link" items={results.links} renderItem={(l,i)=>(
            <div key={i} className="card-sm mb-2 flex items-center gap-3">
              <Icon name="link" size={16} style={{color:'var(--accent)',flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700}}>{l.title}</div>
                <a href={l.url} target="_blank" rel="noopener noreferrer" style={{color:'var(--blue)',fontSize:12}}>{l.url}</a>
              </div>
            </div>
          )}/>
          <Section type="Problem" items={results.problems} renderItem={(p,i)=>(
            <div key={i} className="card-sm mb-2 flex items-center gap-3">
              <Icon name="code" size={16} style={{color:'var(--purple)',flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:700}}>{p.title}</div>
                <div className="text-xs text-muted">{p.difficulty} · {p.status}</div>
              </div>
            </div>
          )}/>
          <Section type="Task" items={results.todos} renderItem={(t,i)=>(
            <div key={i} className="card-sm mb-2 flex items-center gap-3">
              <div style={{width:16,height:16,borderRadius:'50%',border:'2px solid var(--border)',display:'grid',placeItems:'center',flexShrink:0,background:t.done?'var(--green)':'none',borderColor:t.done?'var(--green)':'var(--border)'}}>
                {t.done&&<Icon name="check" size={10} style={{color:'white'}}/>}
              </div>
              <div style={{flex:1,textDecoration:t.done?'line-through':'none',color:t.done?'var(--text3)':'var(--text)'}}>{t.text}</div>
            </div>
          )}/>
        </>
      )}

      {!query && (
        <div style={{textAlign:'center',padding:'60px 0',color:'var(--text3)'}}>
          <div style={{fontSize:48,marginBottom:14,opacity:.5}}>🔍</div>
          <div style={{fontWeight:700,fontSize:17,color:'var(--text2)',marginBottom:6}}>Start typing to search</div>
          <div style={{fontSize:13}}>Search across subjects, notes, links, DSA problems, and tasks</div>
        </div>
      )}
    </div>
  );
};
export default SearchPage;
