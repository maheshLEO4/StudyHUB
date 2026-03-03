/**
 * Search Page
 * Global search across all content
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, BookOpen, Link2, Code2, Loader, X } from 'lucide-react';

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();
  const debounced = useDebounce(query, 400);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setResults(null);
      return;
    }
    const search = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/search', { params: { q: debounced } });
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    search();
  }, [debounced]);

  const totalResults = results
    ? (results.subjects?.length || 0) + (results.links?.length || 0) + (results.dsa?.length || 0)
    : 0;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>Search</h1>
          <p>Find anything across your study materials</p>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: 'var(--space-8)' }}>
        <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input
          ref={inputRef}
          className="form-input"
          type="text"
          placeholder="Search notes, links, DSA problems..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: 48, paddingRight: 44, fontSize: '1rem', height: 52, borderRadius: 'var(--radius-lg)' }}
        />
        {query && (
          <button style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }} onClick={() => { setQuery(''); setResults(null); }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Status */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
          <Loader size={24} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--color-primary)' }} />
        </div>
      )}

      {!loading && query.length >= 2 && results && totalResults === 0 && (
        <div className="card">
          <div className="empty-state">
            <Search size={36} style={{ opacity: 0.3 }} />
            <h3>No results found</h3>
            <p>Try a different search term or check your spelling.</p>
          </div>
        </div>
      )}

      {!loading && results && totalResults > 0 && (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
            Found <strong>{totalResults}</strong> result{totalResults !== 1 ? 's' : ''} for "<strong>{debounced}</strong>"
          </p>

          {/* Subject Results */}
          {results.subjects?.length > 0 && (
            <div className="search-result-section">
              <h3><BookOpen size={14} style={{ display: 'inline', marginRight: 6 }} />Subjects ({results.subjects.length})</h3>
              {results.subjects.map((subject) => (
                <div key={subject._id} className="card search-result-item" onClick={() => navigate(`/subjects/${subject._id}`)}>
                  <span style={{ fontSize: '1.5rem' }}>{subject.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{subject.name}</div>
                    {subject.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{subject.description}</div>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {subject.notes?.length || 0} notes
                    </div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: subject.color, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}

          {/* Links Results */}
          {results.links?.length > 0 && (
            <div className="search-result-section">
              <h3><Link2 size={14} style={{ display: 'inline', marginRight: 6 }} />Links ({results.links.length})</h3>
              {results.links.map((link) => (
                <a key={link._id} href={link.url} target="_blank" rel="noreferrer" className="card search-result-item" style={{ display: 'flex' }}>
                  <Link2 size={20} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{link.title}</div>
                    {link.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{link.description}</div>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'flex', gap: 8 }}>
                      <span>{link.category}</span>
                      {link.tags?.map((t) => <span key={t} className="badge badge-subtle">{t}</span>)}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* DSA Results */}
          {results.dsa?.length > 0 && (
            <div className="search-result-section">
              <h3><Code2 size={14} style={{ display: 'inline', marginRight: 6 }} />DSA Problems ({results.dsa.length})</h3>
              {results.dsa.map((prob) => (
                <div key={prob._id} className="card search-result-item" onClick={() => navigate('/dsa')}>
                  <Code2 size={20} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{prob.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                      <span>{prob.platform}</span>
                      <span className={`badge ${prob.difficulty === 'Easy' ? 'badge-success' : prob.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'}`}>{prob.difficulty}</span>
                      <span className="badge badge-subtle">{prob.status}</span>
                      {prob.topic && <span className="badge badge-subtle">{prob.topic}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Initial state */}
      {!query && (
        <div className="card">
          <div className="empty-state">
            <Search size={36} style={{ opacity: 0.3 }} />
            <h3>Start searching</h3>
            <p>Search across your subjects, notes, links, and DSA problems all at once.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
