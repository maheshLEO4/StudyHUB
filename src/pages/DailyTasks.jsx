import { useState, useEffect } from 'react'
import { Plus, X, RotateCcw, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { DailyTaskAPI } from '@/lib/supabase'
import { Button, Card, ProgressBar } from '@/components/ui'
import styles from '@/styles/DailyTasks.module.css'

export default function DailyTasks() {
  const [tasks, setTasks] = useState(() => DailyTaskAPI.load())
  const [input, setInput] = useState('')
  const [showInput, setShowInput] = useState(false)

  const save = (updated) => {
    DailyTaskAPI.save(updated)
    setTasks(updated)
  }

  const addTask = () => {
    const t = input.trim()
    if (!t) return
    save([...tasks, { id: Date.now(), text: t, done: false }])
    setInput('')
    setShowInput(false)
  }

  const toggle = (id) => save(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  const remove = (id) => save(tasks.filter(t => t.id !== id))
  const resetAll = () => save(tasks.map(t => ({ ...t, done: false })))

  const doneCount = tasks.filter(t => t.done).length
  const remaining = tasks.length - doneCount
  const progress = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0
  const allDone = tasks.length > 0 && doneCount === tasks.length

  const pending = tasks.filter(t => !t.done)
  const completed = tasks.filter(t => t.done)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Daily Tasks</h1>
          <p className={styles.subtitle}>{format(new Date(), 'EEEE, MMMM d, yyyy')} · Resets each day</p>
        </div>
        <div className={styles.headerActions}>
          {allDone && (
            <span className={styles.allDoneBadge}><Sparkles size={12} /> All done!</span>
          )}
          {doneCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetAll}><RotateCcw size={13} /> Reset</Button>
          )}
          {!showInput ? (
            <Button onClick={() => setShowInput(true)}><Plus size={14} /> Add Task</Button>
          ) : (
            <div className={styles.inlineInput}>
              <input
                autoFocus
                className={styles.inputBox}
                placeholder="Task name…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addTask()
                  if (e.key === 'Escape') { setShowInput(false); setInput('') }
                }}
              />
              <Button onClick={addTask}><Plus size={14} /> Add</Button>
              <Button variant="ghost" onClick={() => { setShowInput(false); setInput('') }}>
                <X size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statRow}>
        {[
          { label: 'Total', value: tasks.length, color: '#7c6af7', bg: 'rgba(124,106,247,0.12)' },
          { label: 'Completed', value: doneCount, color: '#52d68a', bg: 'rgba(82,214,138,0.12)' },
          { label: 'Remaining', value: remaining, color: '#f5c542', bg: 'rgba(245,197,66,0.12)' },
        ].map(s => (
          <Card key={s.label} className={styles.statCard}>
            <div className={styles.statIconBox} style={{ background: s.bg }}>
              <span style={{ fontSize: 16, color: s.color }}>{s.label === 'Total' ? '🎯' : s.label === 'Completed' ? '🔥' : '⏳'}</span>
            </div>
            <div>
              <p className={styles.statValue} style={{ color: s.color }}>{s.value}</p>
              <p className={styles.statLabel}>{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Progress */}
      {tasks.length > 0 && (
        <Card className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Today's Progress</span>
            <span className={styles.progressPct} style={{ color: allDone ? 'var(--green)' : 'var(--accent)' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <ProgressBar value={progress} gradient={!allDone} />
          <p className={styles.progressCaption}>{doneCount} of {tasks.length} tasks completed today</p>
        </Card>
      )}

      {/* Pending */}
      <Card className={styles.listCard}>
        <p className={styles.listHeading}>To Do · {pending.length}</p>
        {pending.length === 0 ? (
          <div className={styles.listEmpty}>
            <span style={{ fontSize: 32 }}>{tasks.length === 0 ? '📋' : '🎉'}</span>
            <p>{tasks.length === 0 ? 'No tasks yet — add one above!' : 'All tasks completed!'}</p>
          </div>
        ) : (
          <div className={styles.taskList}>
            {pending.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <button className={styles.circle} onClick={() => toggle(task.id)} />
                <span className={styles.taskText}>{task.text}</span>
                <button className={styles.removeBtn} onClick={() => remove(task.id)}><X size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Completed */}
      {completed.length > 0 && (
        <Card className={styles.listCard}>
          <p className={styles.listHeading}>Completed · {completed.length}</p>
          <div className={styles.taskList}>
            {completed.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <button
                  className={styles.circleDone}
                  onClick={() => toggle(task.id)}
                >✓</button>
                <span className={styles.taskTextDone}>{task.text}</span>
                <button className={styles.removeBtn} onClick={() => remove(task.id)}><X size={13} /></button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
