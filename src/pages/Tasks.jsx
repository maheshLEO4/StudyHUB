import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, CheckSquare, Square, Calendar } from 'lucide-react'
import { format, parseISO, isPast } from 'date-fns'
import { TaskAPI } from '@/lib/supabase'
import { Button, Card, Modal, Input, Select, EmptyState, Skeleton } from '@/components/ui'
import styles from '@/styles/Tasks.module.css'

const PRIORITIES = ['Low', 'Medium', 'High']
const PRIORITY_COLORS = { High: '#f06a6a', Medium: '#f5c542', Low: '#52d68a' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', checklist_name: '', due_date: '', priority: 'Medium' })
  const [filterStatus, setFilterStatus] = useState('pending')

  const load = () => TaskAPI.list().then(setTasks).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', checklist_name: '', due_date: '', priority: 'Medium' })
    setModal(true)
  }

  const openEdit = (t) => {
    setEditing(t)
    setForm({ title: t.title, checklist_name: t.checklist_name || '', due_date: t.due_date || '', priority: t.priority || 'Medium' })
    setModal(true)
  }

  const save = async () => {
    if (!form.title.trim()) return
    const payload = { title: form.title, checklist_name: form.checklist_name || null, due_date: form.due_date || null, priority: form.priority }
    if (editing) await TaskAPI.update(editing.id, payload)
    else await TaskAPI.create(payload)
    setModal(false)
    load()
  }

  const toggle = async (task) => {
    await TaskAPI.toggleComplete(task)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))
  }

  const del = async (id) => {
    await TaskAPI.delete(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const filtered = tasks.filter(t =>
    filterStatus === 'all' ? true : filterStatus === 'pending' ? !t.completed : t.completed
  )

  const pendingCount = tasks.filter(t => !t.completed).length
  const doneCount = tasks.filter(t => t.completed).length

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Tasks</h1>
          <p className={styles.subtitle}>{pendingCount} pending · {doneCount} completed</p>
        </div>
        <Button onClick={openCreate}><Plus size={14} /> Add Task</Button>
      </div>

      <div className={styles.tabs}>
        {[['pending', 'Pending'], ['completed', 'Completed'], ['all', 'All']].map(([v, l]) => (
          <button key={v} className={`${styles.tab} ${filterStatus === v ? styles.tabActive : ''}`} onClick={() => setFilterStatus(v)}>{l}</button>
        ))}
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1,2,3,4].map(i => <Skeleton key={i} height={56} borderRadius={12} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={filterStatus === 'completed' ? '📋' : '🎉'}
            message={filterStatus === 'completed' ? 'No completed tasks yet' : 'No pending tasks — all done!'}
            action={filterStatus !== 'completed' && <Button onClick={openCreate}><Plus size={13} /> Add Task</Button>}
          />
        </Card>
      ) : (
        <div className={styles.list}>
          {filtered.map(task => {
            const overdue = task.due_date && !task.completed && isPast(parseISO(task.due_date))
            return (
              <Card key={task.id} className={`${styles.taskCard} ${task.completed ? styles.done : ''}`}>
                <button className={styles.checkBtn} onClick={() => toggle(task)}>
                  {task.completed
                    ? <CheckSquare size={18} color="var(--accent)" />
                    : <Square size={18} color="var(--text3)" />}
                </button>

                <div className={styles.taskBody}>
                  <span className={`${styles.taskTitle} ${task.completed ? styles.strikethrough : ''}`}>{task.title}</span>
                  <div className={styles.taskMeta}>
                    {task.checklist_name && <span className={styles.groupTag}>{task.checklist_name}</span>}
                    {task.due_date && (
                      <span className={`${styles.dueDate} ${overdue ? styles.overdue : ''}`}>
                        <Calendar size={10} /> {format(parseISO(task.due_date), 'MMM d')}{overdue ? ' (overdue)' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.priorityDot} style={{ background: PRIORITY_COLORS[task.priority] || '#8b8a95' }} title={task.priority} />

                <div className={styles.taskActions}>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(task)}><Pencil size={12} /></Button>
                  <Button variant="danger" size="sm" onClick={() => del(task.id)}><Trash2 size={12} /></Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Task' : 'Add Task'}>
        <div className={styles.formGrid}>
          <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" />
          <Input label="Group / Checklist" value={form.checklist_name} onChange={e => setForm({ ...form, checklist_name: e.target.value })} placeholder="e.g. College, Personal" />
          <div className={styles.row2}>
            <Input label="Due Date" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save}>Save Task</Button>
        </div>
      </Modal>
    </div>
  )
}
