import React, { useState, useEffect, useRef } from "react";
import { Search, BookOpen, FileText, Link2, Code2, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { searchAPI } from "../utils/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults(null); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const r = await searchAPI.search(query); setResults(r.data.data || null); }
      catch { setResults(null); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const totalCount = results ? (results.subjects?.length || 0) + (results.notes?.length || 0) + (results.links?.length || 0) + (results.problems?.length || 0) + (results.tasks?.length || 0) : 0;

  const ResultSection = ({ title, icon: Icon, color, items, renderItem }) => {
    if (!items?.length) return null;
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={16} style={{ color }} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>{title}</span>
          <span className="badge badge-gray">{items.length}</span>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {items.map((item, i) => (
            <div key={item._id || i} style={{ padding: "12px 16px", borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"} onMouseLeave={e => e.currentTarget.style.background = ""} onClick={() => renderItem.navigate && navigate(renderItem.navigate(item))}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout currentPage="Search">
      <div style={{ maxWidth: 700 }}>
        <div style={{ marginBottom: 28 }}>
          <div className="section-title mb-2">Search Everything</div>
          <div className="search-input-wrap" style={{ height: 52 }}>
            <Search size={20} style={{ color: "var(--text3)", flexShrink: 0 }} />
            <input ref={inputRef} placeholder="Search subjects, notes, links, DSA problems, tasks..." value={query} onChange={e => setQuery(e.target.value)} style={{ fontSize: 15 }} onKeyDown={e => e.key === "Escape" && setQuery("")} />
            {query && <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: "0 4px" }} onClick={() => setQuery("")}>✕</button>}
          </div>
        </div>

        {loading && <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><span className="spinner" /></div>}

        {!query && !loading && (
          <div className="empty-state"><Search size={40} /><h3>Search your workspace</h3><p>Find anything across subjects, notes, links, DSA problems, and tasks</p></div>
        )}

        {query.trim().length === 1 && <div style={{ color: "var(--text3)", fontSize: 13 }}>Type at least 2 characters to search...</div>}

        {results && !loading && (
          <>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>
              {totalCount > 0 ? `${totalCount} results for "${query}"` : `No results for "${query}"`}
            </div>

            <ResultSection title="Subjects" icon={BookOpen} color="var(--accent)" items={results.subjects} renderItem={Object.assign(
              item => (<div><div style={{ fontWeight: 700 }}>{item.icon} {item.name}</div>{item.description && <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{item.description}</div>}</div>),
              { navigate: () => "/subjects" }
            )} />

            <ResultSection title="Notes" icon={FileText} color="var(--success)" items={results.notes} renderItem={Object.assign(
              item => (<div><div style={{ fontWeight: 700 }}>{item.is_important && "⭐ "}{item.title}</div><div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>in {item.subject?.name}</div></div>),
              { navigate: () => "/subjects" }
            )} />

            <ResultSection title="Links" icon={Link2} color="var(--danger)" items={results.links} renderItem={Object.assign(
              item => (<div><div style={{ fontWeight: 700 }}>{item.title}</div><a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--accent)" }} onClick={e => e.stopPropagation()}>{item.url}</a></div>),
              { navigate: () => "/links" }
            )} />

            <ResultSection title="DSA Problems" icon={Code2} color="var(--warning)" items={results.problems} renderItem={Object.assign(
              item => (<div><div style={{ fontWeight: 700 }}>{item.title} <span className="badge badge-gray">{item.difficulty}</span></div>{item.topic && <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{item.topic}</div>}</div>),
              { navigate: () => "/dsa" }
            )} />

            <ResultSection title="Tasks" icon={CheckSquare} color="var(--warning)" items={results.tasks} renderItem={Object.assign(
              item => (<div><div style={{ fontWeight: 700, textDecoration: item.completed ? "line-through" : "none", color: item.completed ? "var(--text3)" : "var(--text)" }}>{item.title}</div><div style={{ fontSize: 12, color: "var(--text2)" }}>{item.checklist_name}</div></div>),
              { navigate: () => "/tasks" }
            )} />
          </>
        )}
      </div>
    </Layout>
  );
}