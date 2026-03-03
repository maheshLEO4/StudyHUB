import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, FileText, Link2, Code2, CheckSquare, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { searchAPI } from '../utils/api';

const SECTION_CFG = {
  Subjects: { icon: BookOpen, accent: '#6366f1', route: '/subjects' },
  Notes: { icon: FileText, accent: '#10b981', route: '/subjects' },
  Links: { icon: Link2, accent: '#8b5cf6', route: '/links' },
  'DSA Problems': { icon: Code2, accent: '#f59e0b', route: '/dsa' },
  Tasks: { icon: CheckSquare, accent: '#ef4444', route: '/tasks' },
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
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

  const totalCount = results
    ? (results.subjects?.length || 0) + (results.notes?.length || 0) + (results.links?.length || 0) + (results.problems?.length || 0) + (results.tasks?.length || 0)
    : 0;

  const sections = results ? [
    { key: 'Subjects', items: results.subjects, render: item => ({ title: `${item.icon} ${item.name}`, sub: item.description }) },
    { key: 'Notes', items: results.notes, render: item => ({ title: (item.is_important ? '⭐ ' : '') + item.title, sub: `in ${item.subject?.name || 'Unknown'}` }) },
    { key: 'Links', items: results.links, render: item => ({ title: item.title, sub: item.url }) },
    { key: 'DSA Problems', items: results.problems, render: item => ({ title: item.title, sub: `${item.difficulty}${item.topic ? ' · ' + item.topic : ''}` }) },
    { key: 'Tasks', items: results.tasks, render: item => ({ title: item.title, sub: item.checklist_name, done: item.completed }) },
  ] : [];

  return (
    <Layout currentPage="Search">
      <div style={{ maxWidth: 680 }}>
        {/* Header */}
        <div className="page-header" style={{ marginBottom: 20 }}>
          <div>
            <div className="page-title">Search</div>
            <div className="page-subtitle">Find anything across your workspace</div>
          </div>
        </div>

        {/* Search input */}
        <div className="search-input-wrap mb-6" style={{ height: 52 }}>
          <Search size={18} style={{ color: 'var(--text3)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            placeholder="Search subjects, notes, links, DSA problems, tasks..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ fontSize: 14.5 }}
            onKeyDown={e => e.key === 'Escape' && setQuery('')}
          />
          {query && (
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: '0 4px', display: 'grid', placeItems: 'center' }} onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* States */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner" /></div>
        )}

        {!query && !loading && (
          <div className="empty-state">
            <div className="empty-emoji">🔍</div>
            <h3>Search your workspace</h3>
            <p>Find anything across subjects, notes, links, DSA problems, and tasks</p>
          </div>
        )}

        {query.trim().length === 1 && (
          <div style={{ color: 'var(--text3)', fontSize: 13, textAlign: 'center', padding: 20 }}>
            Type at least 2 characters to search…
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <>
            <div style={{ fontSize: 12.5, color: 'var(--text3)', marginBottom: 20, fontWeight: 600 }}>
              {totalCount > 0
                ? <>{totalCount} result{totalCount !== 1 ? 's' : ''} for <span style={{ color: 'var(--text)', fontStyle: 'italic' }}>"{query}"</span></>
                : <>No results for <span style={{ color: 'var(--text)', fontStyle: 'italic' }}>"{query}"</span></>
              }
            </div>

            {sections.map(({ key, items, render }) => {
              if (!items?.length) return null;
              const cfg = SECTION_CFG[key];
              const Icon = cfg.icon;
              return (
                <div key={key} style={{ marginBottom: 24 }}>
                  {/* Section header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: cfg.accent, display: 'grid', placeItems: 'center', color: 'white' }}>
                      <Icon size={13} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{key}</span>
                    <span style={{ fontSize: 10, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '1px 7px', fontWeight: 700, color: 'var(--text3)' }}>{items.length}</span>
                    <button
                      onClick={() => navigate(cfg.route)}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
                    >
                      View all <ArrowRight size={11} />
                    </button>
                  </div>

                  {/* Result items */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    {items.map((item, i) => {
                      const { title, sub, done } = render(item);
                      return (
                        <div
                          key={item._id || i}
                          onClick={() => navigate(cfg.route)}
                          style={{
                            padding: '11px 16px',
                            borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                            cursor: 'pointer', transition: 'background .15s',
                            display: 'flex', alignItems: 'center', gap: 10,
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13.5, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text3)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {title}
                            </div>
                            {sub && (
                              <div style={{ fontSize: 11.5, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                                {sub}
                              </div>
                            )}
                          </div>
                          <ArrowRight size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </Layout>
  );
}