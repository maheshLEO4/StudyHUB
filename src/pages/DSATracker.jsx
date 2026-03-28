import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, Search } from 'lucide-react'
import { DSAApi } from '@/lib/supabase'
import { Button, Card, Modal, Input, Select, Textarea, EmptyState, ProgressBar, Skeleton, Badge } from '@/components/ui'
import styles from '@/styles/DSATracker.module.css'

const STATUSES = ['Not Started', 'In Progress', 'Completed']
const DIFFS = ['Easy', 'Medium', 'Hard']
const STATUS_COLOR = { 'Not Started': '#8b8a95', 'In Progress': '#f5c542', Completed: '#52d68a' }
const DIFF_COLOR = { Easy: '#52d68a', Medium: '#f5c542', Hard: '#f06a6a' }

const EMPTY_FORM = { title: '', url: '', status: 'Not Started', difficulty: 'Medium', topic: '', notes: '' }

export default function DSATracker() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDiff, setFilterDiff] = useState('All')

  const load = () => DSAApi.list().then(setProblems).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true) }
  const openEdit = (p) => {
    setEditing(p)
    setForm({ title: p.title, url: p.url || '', status: p.status, difficulty: p.difficulty || 'Medium', topic: p.topic || '', notes: p.notes || '' })
    setModal(true)
  }

  const save = async () => {
    if (!form.title.trim()) return
    if (editing) await DSAApi.update(editing.id, form)
    else await DSAApi.create(form)
    setModal(false)
    load()
  }

  const del = async (id) => {
    if (!confirm('Delete this problem?')) return
    await DSAApi.delete(id)
    load()
  }

  const updateStatus = async (id, status) => {
    await DSAApi.updateStatus(id, status)
    setProblems(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const filtered = problems.filter(p => {
    const ms = filterStatus === 'All' || p.status === filterStatus
    const md = filterDiff === 'All' || p.difficulty === filterDiff
    const mq = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.topic || '').toLowerCase().includes(search.toLowerCase())
    return ms && md && mq
  })

  const total = problems.length
  const completed = problems.filter(p => p.status === 'Completed').length
  const inProgress = problems.filter(p => p.status === 'In Progress').length
  const notStarted = problems.filter(p => p.status === 'Not Started').length
  const pct = total > 0 ? Math.round(completed / total * 100) : 0

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>DSA Tracker</h1>
          <p className={styles.subtitle}>{total} problems · {pct}% solved</p>
        </div>
        <Button onClick={openCreate}><Plus size={14} /> Add Problem</Button>
      </div>

      {/* Stats */}
      <div className={styles.statRow}>
        {[
          { label: 'Not Started', count: notStarted, color: STATUS_COLOR['Not Started'] },
          { label: 'In Progress', count: inProgress, color: STATUS_COLOR['In Progress'] },
          { label: 'Completed',   count: completed,  color: STATUS_COLOR['Completed'] },
        ].map(s => (
          <Card key={s.label} className={styles.statCard}>
            <span className={styles.statCount} style={{ color: s.color }}>{s.count}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card className={styles.progressCard}>
        <div className={styles.progressRow}>
          <span className={styles.progressLabel}>Overall Progress</span>
          <span className={styles.progressPct}>{pct}%</span>
        </div>
        <ProgressBar value={pct} gradient />
      </Card>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search by title or topic…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={styles.filterSelect} value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
          <option value="All">All Difficulty</option>
          {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.skeletons}>
          {[1,2,3,4,5].map(i => <Skeleton key={i} height={50} borderRadius={0} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="💻" message="No problems found" action={<Button onClick={openCreate}><Plus size={13} /> Add Problem</Button>} /></Card>
      ) : (
        <Card className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th style={{ width: 80 }} />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className={styles.row}>
                    <td>
                      <div className={styles.problemCell}>
                        <span className={styles.problemTitle}>{p.title}</span>
                        {p.url && (
                          <a href={p.url} target="_blank" rel="noreferrer" className={styles.extLink}>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td><span className={styles.topic}>{p.topic || '—'}</span></td>
                    <td>
                      {p.difficulty && (
                        <span className={styles.diffBadge} style={{ background: DIFF_COLOR[p.difficulty] + '20', color: DIFF_COLOR[p.difficulty] }}>
                          {p.difficulty}
                        </span>
                      )}
                    </td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={p.status}
                        onChange={e => updateStatus(p.id, e.target.value)}
                        style={{ background: STATUS_COLOR[p.status] + '18', color: STATUS_COLOR[p.status], borderColor: STATUS_COLOR[p.status] + '50' }}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={12} /></Button>
                        <Button variant="danger" size="sm" onClick={() => del(p.id)}><Trash2 size={12} /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Problem' : 'Add Problem'}>
        <div className={styles.formGrid}>
          <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Two Sum" />
          <Input label="LeetCode / Problem URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://leetcode.com/problems/..." />
          <Input label="Topic" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Arrays, Dynamic Programming" />
          <div className={styles.row2}>
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Difficulty" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </div>
          <Textarea label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Approach, hints, complexity…" rows={3} />
        </div>
        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </Modal>
    </div>
  )
}
