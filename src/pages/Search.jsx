import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, BookOpen, FileText, Link2, Code2, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SubjectAPI, NoteAPI, LinkAPI, DSAApi } from '@/lib/supabase'
import { Card } from '@/components/ui'
import styles from '@/styles/Search.module.css'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ subjects: [], notes: [], links: [], problems: [] })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (!query.trim()) { setResults({ subjects: [], notes: [], links: [], problems: [] }); return }
    const timer = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const doSearch = async (q) => {
    setLoading(true)
    const lq = q.toLowerCase()
    const [subjects, notes, links, problems] = await Promise.all([
      SubjectAPI.list(),
      NoteAPI.listAll(),
      LinkAPI.list(),
      DSAApi.list(),
    ])
    setResults({
      subjects: subjects.filter(s => s.name.toLowerCase().includes(lq) || (s.description || '').toLowerCase().includes(lq)),
      notes: notes.filter(n => n.title.toLowerCase().includes(lq) || (n.content || '').toLowerCase().includes(lq)),
      links: links.filter(l => l.title.toLowerCase().includes(lq) || l.url.toLowerCase().includes(lq) || (l.description || '').toLowerCase().includes(lq)),
      problems: problems.filter(p => p.title.toLowerCase().includes(lq) || (p.topic || '').toLowerCase().includes(lq)),
    })
    setLoading(false)
  }

  const total = results.subjects.length + results.notes.length + results.links.length + results.problems.length

  const highlight = (text, q) => {
    if (!q || !text) return text?.substring(0, 100) || ''
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text.substring(0, 100)
    const start = Math.max(0, idx - 30)
    const end = Math.min(text.length, idx + q.length + 60)
    return (start > 0 ? '…' : '') + text.substring(start, end) + (end < text.length ? '…' : '')
  }

  const STATUS_COLORS = { 'Not Started': '#8b8a95', 'In Progress': '#f5c542', Completed: '#52d68a' }

  return (
    <div className={styles.page}>
      <div className={styles.searchBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>
        <div className={styles.inputWrap}>
          <SearchIcon size={16} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search subjects, notes, links, DSA problems…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {query && (
        <p className={styles.resultCount}>
          {loading ? 'Searching…' : `${total} result${total !== 1 ? 's' : ''} for "${query}"`}
        </p>
      )}

      {!query && (
        <Card className={styles.emptyPrompt}>
          <SearchIcon size={40} className={styles.emptyIcon} />
          <p className={styles.emptyText}>Search across all your study materials</p>
          <p className={styles.emptySubtext}>Subjects · Notes · Links · DSA Problems</p>
        </Card>
      )}

      {query && !loading && total === 0 && (
        <Card className={styles.emptyPrompt}>
          <p className={styles.emptyText}>No results found for "{query}"</p>
        </Card>
      )}

      {/* Results */}
      <div className={styles.sections}>
        {results.subjects.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <BookOpen size={13} color="#7c6af7" />
              <span>Subjects</span>
              <span className={styles.sectionCount}>{results.subjects.length}</span>
            </div>
            {results.subjects.map(s => (
              <Card key={s.id} className={styles.resultItem} onClick={() => navigate('/subjects')}>
                <div className={styles.resultIcon} style={{ background: (s.color || '#7c6af7') + '20', fontSize: 16 }}>{s.icon || '📚'}</div>
                <div>
                  <p className={styles.resultTitle}>{s.name}</p>
                  {s.description && <p className={styles.resultSub}>{s.description}</p>}
                </div>
              </Card>
            ))}
          </div>
        )}

        {results.notes.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FileText size={13} color="#5b9cf6" />
              <span>Notes</span>
              <span className={styles.sectionCount}>{results.notes.length}</span>
            </div>
            {results.notes.map(n => (
              <Card key={n.id} className={styles.resultItem} onClick={() => navigate('/subjects')}>
                <div>
                  <p className={styles.resultTitle}>{n.title}</p>
                  <p className={styles.resultSub}>{highlight(n.content?.replace(/[#*`_>~[\]!]/g, ' ') || '', query)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {results.links.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Link2 size={13} color="#f06a8a" />
              <span>Links</span>
              <span className={styles.sectionCount}>{results.links.length}</span>
            </div>
            {results.links.map(l => (
              <Card key={l.id} className={styles.resultItem} onClick={() => window.open(l.url, '_blank')}>
                <div>
                  <p className={styles.resultTitle}>{l.title}</p>
                  <p className={styles.resultSub}>{l.url}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {results.problems.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Code2 size={13} color="#52d68a" />
              <span>DSA Problems</span>
              <span className={styles.sectionCount}>{results.problems.length}</span>
            </div>
            {results.problems.map(p => (
              <Card key={p.id} className={styles.resultItem} onClick={() => navigate('/dsa')}>
                <div>
                  <p className={styles.resultTitle}>{p.title}</p>
                  <div className={styles.resultMeta}>
                    {p.topic && <span className={styles.metaTag}>{p.topic}</span>}
                    <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[p.status] }}>{p.status}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
