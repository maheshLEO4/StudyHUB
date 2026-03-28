import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, Search } from 'lucide-react'
import { LinkAPI } from '@/lib/supabase'
import { Button, Card, Modal, Input, Select, Textarea, Tag, EmptyState, Skeleton } from '@/components/ui'
import styles from '@/styles/Links.module.css'

const CATEGORIES = ['DSA Problems', 'YouTube', 'Articles', 'Coding Platforms', 'Other']
const CAT_COLORS = {
  'DSA Problems': '#7c6af7', YouTube: '#f06a6a', Articles: '#5b9cf6',
  'Coding Platforms': '#52d68a', Other: '#8b8a95',
}

const EMPTY_FORM = { title: '', url: '', description: '', category: 'Other', tags: [] }

export default function Links() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const load = () => LinkAPI.list().then(setLinks).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setTagInput(''); setModal(true) }
  const openEdit = (l) => {
    setEditing(l)
    setForm({ title: l.title, url: l.url, description: l.description || '', category: l.category || 'Other', tags: l.tags || [] })
    setTagInput('')
    setModal(true)
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) { setForm({ ...form, tags: [...form.tags, t] }); setTagInput('') }
  }

  const save = async () => {
    if (!form.title.trim() || !form.url.trim()) return
    if (editing) await LinkAPI.update(editing.id, form)
    else await LinkAPI.create(form)
    setModal(false)
    load()
  }

  const del = async (id) => {
    if (!confirm('Delete this link?')) return
    await LinkAPI.delete(id)
    load()
  }

  const filtered = links.filter(l => {
    const mc = filter === 'All' || l.category === filter
    const ms = !search || l.title.toLowerCase().includes(search.toLowerCase()) || l.url.toLowerCase().includes(search.toLowerCase()) || (l.description || '').toLowerCase().includes(search.toLowerCase())
    return mc && ms
  })

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Important Links</h1>
          <p className={styles.subtitle}>{links.length} links saved</p>
        </div>
        <Button onClick={openCreate}><Plus size={14} /> Add Link</Button>
      </div>

      {/* Search + filter */}
      <div className={styles.filterRow}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search links…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.catFilters}>
          {['All', ...CATEGORIES].map(c => (
            <button
              key={c}
              className={`${styles.catBtn} ${filter === c ? styles.catBtnActive : ''}`}
              onClick={() => setFilter(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className={styles.list}>
          {[1,2,3,4].map(i => <Skeleton key={i} height={72} borderRadius={14} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><EmptyState icon="🔗" message="No links found" action={<Button onClick={openCreate}><Plus size={13} /> Add Link</Button>} /></Card>
      ) : (
        <div className={styles.list}>
          {filtered.map(link => (
            <Card key={link.id} className={styles.linkCard}>
              <div className={styles.linkIcon} style={{ background: (CAT_COLORS[link.category] || '#8b8a95') + '18' }}>
                <ExternalLink size={15} style={{ color: CAT_COLORS[link.category] || '#8b8a95' }} />
              </div>
              <div className={styles.linkBody}>
                <div className={styles.linkTopRow}>
                  <a href={link.url} target="_blank" rel="noreferrer" className={styles.linkTitle}>{link.title}</a>
                  <span className={styles.catBadge} style={{ background: (CAT_COLORS[link.category] || '#8b8a95') + '18', color: CAT_COLORS[link.category] || '#8b8a95' }}>
                    {link.category || 'Other'}
                  </span>
                </div>
                {link.description && <p className={styles.linkDesc}>{link.description}</p>}
                <p className={styles.linkUrl}>{link.url}</p>
                {link.tags?.length > 0 && (
                  <div className={styles.tagRow}>
                    {link.tags.map(t => <Tag key={t}>{t}</Tag>)}
                  </div>
                )}
              </div>
              <div className={styles.linkActions}>
                <Button variant="ghost" size="sm" onClick={() => openEdit(link)}><Pencil size={12} /></Button>
                <Button variant="danger" size="sm" onClick={() => del(link.id)}><Trash2 size={12} /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Link' : 'Add Link'}>
        <div className={styles.formGrid}>
          <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Resource title" />
          <Input label="URL *" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://…" />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
          <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div>
            <p className={styles.tagsLabel}>Tags</p>
            <div className={styles.tagsRow}>
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
          <Button onClick={save}>{editing ? 'Save Changes' : 'Save Link'}</Button>
        </div>
      </Modal>
    </div>
  )
}
