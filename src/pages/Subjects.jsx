import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Plus, Pencil, Trash2, ChevronRight, ArrowLeft, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { SubjectAPI, NoteAPI } from '@/lib/supabase'
import { Button, Card, Modal, Input, Textarea, Select, Tag, EmptyState, Badge, Skeleton } from '@/components/ui'
import styles from '@/styles/Subjects.module.css'

const COLORS = ['#7c6af7','#f06a8a','#52d68a','#f5c542','#5b9cf6','#f06a6a','#4ecdc4','#f97316']
const EMOJIS = ['📚','🧮','💻','🔬','📐','🌍','🎨','📝','⚗️','🧬','📊','🔭']

// ─── Subject List ──────────────────────────────────────────────────────────

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', color: COLORS[0], icon: EMOJIS[0] })
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)

  const load = () => SubjectAPI.list().then(setSubjects).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', color: COLORS[0], icon: EMOJIS[0] })
    setModal(true)
  }

  const openEdit = (s, e) => {
    e.stopPropagation()
    setEditing(s)
    setForm({ name: s.name, description: s.description || '', color: s.color || COLORS[0], icon: s.icon || EMOJIS[0] })
    setModal(true)
  }

  const save = async () => {
    if (!form.name.trim()) return
    if (editing) await SubjectAPI.update(editing.id, form)
    else await SubjectAPI.create(form)
    setModal(false)
    load()
  }

  const del = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this subject and all its notes?')) return
    await SubjectAPI.delete(id)
    load()
  }

  if (selected) {
    return <SubjectDetail subject={selected} onBack={() => { setSelected(null); load() }} />
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Subjects</h1>
          <p className={styles.subtitle}>{subjects.length} subjects</p>
        </div>
        <Button onClick={openCreate}><Plus size={14} /> New Subject</Button>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => <Skeleton key={i} height={140} borderRadius={14} />)}
        </div>
      ) : subjects.length === 0 ? (
        <Card><EmptyState icon="📚" message="No subjects yet. Create your first!" action={<Button onClick={openCreate}><Plus size={13} /> Add Subject</Button>} /></Card>
      ) : (
        <div className={styles.grid}>
          {subjects.map(s => (
            <Card key={s.id} className={styles.subjectCard} onClick={() => setSelected(s)}>
              <div className={styles.subjectCardTop}>
                <div className={styles.subjectIcon} style={{ background: (s.color || COLORS[0]) + '20' }}>
                  {s.icon || '📚'}
                </div>
                <div className={styles.subjectActions} onClick={e => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" onClick={e => openEdit(s, e)}><Pencil size={12} /></Button>
                  <Button variant="danger" size="sm" onClick={e => del(s.id, e)}><Trash2 size={12} /></Button>
                </div>
              </div>
              <h3 className={styles.subjectName}>{s.name}</h3>
              {s.description && <p className={styles.subjectDesc}>{s.description}</p>}
              <div className={styles.subjectOpen} style={{ color: s.color || 'var(--accent)' }}>
                Open <ChevronRight size={13} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Subject' : 'New Subject'}>
        <div className={styles.formGrid}>
          <Input label="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Data Structures" />
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." rows={2} />

          <div>
            <p className={styles.fieldLabel}>Icon</p>
            <div className={styles.emojiGrid}>
              {EMOJIS.map(em => (
                <button key={em} className={`${styles.emojiBtn} ${form.icon === em ? styles.emojiBtnActive : ''}`} onClick={() => setForm({ ...form, icon: em })}>
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className={styles.fieldLabel}>Color</p>
            <div className={styles.colorRow}>
              {COLORS.map(c => (
                <button key={c} className={`${styles.colorDot} ${form.color === c ? styles.colorDotActive : ''}`} style={{ background: c }} onClick={() => setForm({ ...form, color: c })} />
              ))}
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save}>{editing ? 'Save Changes' : 'Create'}</Button>
        </div>
      </Modal>
    </div>
  )
}

// ─── Subject Detail ────────────────────────────────────────────────────────

function SubjectDetail({ subject, onBack }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', is_important: false, tags: [] })
  const [tagInput, setTagInput] = useState('')
  const [expanded, setExpanded] = useState({})

  const load = () => NoteAPI.list(subject.id).then(setNotes).finally(() => setLoading(false))
  useEffect(() => { load() }, [subject.id])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', content: '', is_important: false, tags: [] })
    setTagInput('')
    setModal(true)
  }

  const openEdit = (note) => {
    setEditing(note)
    setForm({ title: note.title, content: note.content || '', is_important: note.is_important || false, tags: note.tags || [] })
    setTagInput('')
    setModal(true)
  }

  const save = async () => {
    if (!form.title.trim()) return
    const payload = { subject_id: subject.id, title: form.title, content: form.content, is_important: form.is_important, tags: form.tags }
    if (editing) await NoteAPI.update(editing.id, payload)
    else await NoteAPI.create(payload)
    setModal(false)
    load()
  }

  const del = async (id) => {
    if (!confirm('Delete this note?')) return
    await NoteAPI.delete(id)
    load()
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) {
      setForm({ ...form, tags: [...form.tags, t] })
      setTagInput('')
    }
  }

  const filtered = tab === 'important' ? notes.filter(n => n.is_important) : notes

  return (
    <div className={styles.page}>
      <div className={styles.detailHeader}>
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft size={14} /> Back</Button>
        <div className={styles.subjectMeta}>
          <div className={styles.subjectIconSm} style={{ background: (subject.color || '#7c6af7') + '20' }}>{subject.icon || '📚'}</div>
          <div>
            <h1 className={styles.title}>{subject.name}</h1>
            {subject.description && <p className={styles.subtitle}>{subject.description}</p>}
          </div>
        </div>
        <Button onClick={openCreate} style={{ marginLeft: 'auto' }}><Plus size={14} /> Add Note</Button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[['all', 'All Notes'], ['important', '⭐ Important']].map(([v, l]) => (
          <button key={v} className={`${styles.tab} ${tab === v ? styles.tabActive : ''}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className={styles.noteList}>
          {[1,2,3].map(i => <Skeleton key={i} height={80} borderRadius={14} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="📝" message={tab === 'important' ? 'No important notes' : 'No notes yet — add one!'} action={tab === 'all' && <Button onClick={openCreate}><Plus size={13} /> Add Note</Button>} /></Card>
      ) : (
        <div className={styles.noteList}>
          {filtered.map(note => (
            <Card key={note.id} className={styles.noteCard}>
              <div className={styles.noteCardHeader}>
                <div className={styles.noteMeta}>
                  <div className={styles.noteTitleRow}>
                    <span className={styles.noteTitle}>{note.title}</span>
                    {note.is_important && <Star size={13} fill="#f5c542" color="#f5c542" />}
                  </div>
                  {!expanded[note.id] && note.content && (
                    <p className={styles.notePreview}>{note.content.replace(/[#*`_>~[\]!]/g, '').slice(0, 150)}</p>
                  )}
                  {note.tags?.length > 0 && (
                    <div className={styles.tagRow}>
                      {note.tags.map(t => <Tag key={t}>{t}</Tag>)}
                    </div>
                  )}
                </div>
                <div className={styles.noteActions}>
                  <Button variant="ghost" size="sm" onClick={() => setExpanded(p => ({ ...p, [note.id]: !p[note.id] }))}>
                    {expanded[note.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(note)}><Pencil size={12} /></Button>
                  <Button variant="danger" size="sm" onClick={() => del(note.id)}><Trash2 size={12} /></Button>
                </div>
              </div>

              {expanded[note.id] && (
                <div className={styles.noteContent}>
                  <ReactMarkdown className={styles.noteText}>
                    {note.content || 'No content.'}
                  </ReactMarkdown>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Note' : 'New Note'}>
        <div className={styles.formGrid}>
          <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Note title" />
          <div>
            <p className={styles.fieldLabel}>Content (Markdown)</p>
            <textarea
              className={styles.contentArea}
              rows={7}
              value={form.content}
              onChange={e => setForm({ ...form, content: e.target.value })}
              placeholder="Write your notes here…"
            />
          </div>
          <label className={styles.checkRow}>
            <input type="checkbox" checked={form.is_important} onChange={e => setForm({ ...form, is_important: e.target.checked })} />
            <span>Mark as important ⭐</span>
          </label>
          <div>
            <p className={styles.fieldLabel}>Tags</p>
            <div className={styles.tagRow} style={{ marginBottom: 8 }}>
              {form.tags.map(t => <Tag key={t} onRemove={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })}>{t}</Tag>)}
            </div>
            <div className={styles.tagInputRow}>
              <input
                className={styles.tagInput}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Add a tag…"
              />
              <Button variant="ghost" size="sm" onClick={addTag}>Add</Button>
            </div>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save}>Save Note</Button>
        </div>
      </Modal>
    </div>
  )
}
