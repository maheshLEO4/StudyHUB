import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO, isToday, isTomorrow } from 'date-fns'
import { CalendarDays, CheckSquare, Code2, FileText, ChevronRight, BookOpen } from 'lucide-react'
import { SubjectAPI, NoteAPI, TaskAPI, DSAApi, CalendarAPI } from '@/lib/supabase'
import { Card, ProgressBar, Skeleton } from '@/components/ui'
import styles from '@/styles/Dashboard.module.css'

const EVENT_TYPE_COLORS = {
  Exam: '#f06a6a', Assignment: '#f5c542',
  Study: '#14b8a6', Reminder: '#22c55e', Other: '#8b8a95',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getEventDateLabel(dateStr) {
  const d = parseISO(dateStr)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'MMM d')
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    Promise.all([
      SubjectAPI.list(),
      NoteAPI.listAll(),
      TaskAPI.list(),
      DSAApi.list(),
      CalendarAPI.list(),
    ]).then(([subjects, notes, tasks, dsa, events]) => {
      setData({
        subjects,
        notes: notes.slice(0, 5),
        pendingTasks: tasks.filter(t => !t.completed).slice(0, 5),
        dsa: {
          total: dsa.length,
          completed: dsa.filter(d => d.status === 'Completed').length,
          inProgress: dsa.filter(d => d.status === 'In Progress').length,
          notStarted: dsa.filter(d => d.status === 'Not Started').length,
        },
        upcomingEvents: events.filter(e => e.date >= today).slice(0, 5),
        pendingCount: tasks.filter(t => !t.completed).length,
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const dsaPct = data ? (data.dsa.total > 0 ? Math.round(data.dsa.completed / data.dsa.total * 100) : 0) : 0

  const statCards = [
    { label: 'Subjects', value: data?.subjects.length ?? '…', Icon: BookOpen, color: '#14b8a6', bg: 'rgba(20,184,166,0.15)', to: '/subjects' },
    { label: 'Pending Tasks', value: data?.pendingCount ?? '…', Icon: CheckSquare, color: '#f59e0b', bg: 'rgba(245,158,11,0.16)', to: '/tasks' },
    { label: 'DSA Solved', value: data ? `${data.dsa.completed}/${data.dsa.total}` : '…', Icon: Code2, color: '#22c55e', bg: 'rgba(34,197,94,0.16)', to: '/dsa' },
    { label: 'Total Notes', value: data?.notes.length ?? '…', Icon: FileText, color: '#38bdf8', bg: 'rgba(56,189,248,0.16)', to: '/subjects' },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.greeting}>{getGreeting()}</h1>
        <p className={styles.date}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stat Cards */}
      <div className={styles.statGrid}>
        {statCards.map(({ label, value, Icon, color, bg, to }) => (
          <Link key={label} to={to} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: bg, color }}>
              <Icon size={18} />
            </div>
            <div>
              <p className={styles.statLabel}>{label}</p>
              <p className={styles.statValue} style={{ color }}>
                {loading ? '…' : value}
              </p>
            </div>
            <ChevronRight size={16} className={styles.statArrow} />
          </Link>
        ))}
      </div>

      {/* Middle row */}
      <div className={styles.midRow}>
        {/* Upcoming Events */}
        <Card className={styles.midCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><CalendarDays size={14} /> Upcoming Events</span>
            <Link to="/calendar" className={styles.seeAll}>View all <ChevronRight size={12} /></Link>
          </div>
          {loading ? (
            <div className={styles.skeletonList}>
              {[1,2,3].map(i => <Skeleton key={i} height={36} borderRadius={8} />)}
            </div>
          ) : !data?.upcomingEvents.length ? (
            <p className={styles.empty}>No upcoming events</p>
          ) : (
            <div className={styles.list}>
              {data.upcomingEvents.map(ev => (
                <div key={ev.id} className={styles.eventItem}>
                  <div className={styles.eventDot} style={{ background: EVENT_TYPE_COLORS[ev.type] || '#8b8a95' }} />
                  <span className={styles.eventTitle}>{ev.title}</span>
                  <span className={styles.eventDate}>{getEventDateLabel(ev.date)}</span>
                  <span className={styles.eventType} style={{ background: (EVENT_TYPE_COLORS[ev.type] || '#8b8a95') + '20', color: EVENT_TYPE_COLORS[ev.type] || '#8b8a95' }}>
                    {ev.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Pending Tasks */}
        <Card className={styles.midCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><CheckSquare size={14} /> Pending Tasks</span>
            <Link to="/tasks" className={styles.seeAll}>View all <ChevronRight size={12} /></Link>
          </div>
          {loading ? (
            <div className={styles.skeletonList}>
              {[1,2,3].map(i => <Skeleton key={i} height={32} borderRadius={8} />)}
            </div>
          ) : !data?.pendingTasks.length ? (
            <p className={styles.empty}>All caught up! 🎉</p>
          ) : (
            <div className={styles.list}>
              {data.pendingTasks.map(t => {
                const pc = { High: '#f06a6a', Medium: '#f5c542', Low: '#52d68a' }[t.priority] || '#8b8a95'
                return (
                  <div key={t.id} className={styles.taskItem}>
                    <div className={styles.priorityDot} style={{ background: pc }} />
                    <span className={styles.taskTitle}>{t.title}</span>
                    {t.due_date && <span className={styles.taskDue}>{format(parseISO(t.due_date), 'MMM d')}</span>}
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Recent Notes */}
        <Card className={styles.midCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}><FileText size={14} /> Recent Notes</span>
            <Link to="/subjects" className={styles.seeAll}>View all <ChevronRight size={12} /></Link>
          </div>
          {loading ? (
            <div className={styles.skeletonList}>
              {[1,2,3].map(i => <Skeleton key={i} height={32} borderRadius={8} />)}
            </div>
          ) : !data?.notes.length ? (
            <p className={styles.empty}>No notes yet</p>
          ) : (
            <div className={styles.list}>
              {data.notes.map(n => (
                <div key={n.id} className={styles.noteItem}>
                  <span className={styles.noteTitle}>{n.title}</span>
                  <span className={styles.noteDate}>{format(parseISO(n.updated_at || n.created_at), 'MMM d')}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* DSA Progress */}
      <Card className={styles.dsaCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}><Code2 size={14} /> DSA Progress</span>
          <Link to="/dsa" className={styles.seeAll}>View tracker <ChevronRight size={12} /></Link>
        </div>

        <div className={styles.dsaStats}>
          <div className={styles.dsaNumbers}>
            <div className={styles.dsaCount}>
              <div className={styles.dsaDot} style={{ background: '#8b8a95' }} />
              <span>Not Started: <strong>{data?.dsa.notStarted ?? '…'}</strong></span>
            </div>
            <div className={styles.dsaCount}>
              <div className={styles.dsaDot} style={{ background: '#f5c542' }} />
              <span>In Progress: <strong>{data?.dsa.inProgress ?? '…'}</strong></span>
            </div>
            <div className={styles.dsaCount}>
              <div className={styles.dsaDot} style={{ background: '#52d68a' }} />
              <span>Completed: <strong>{data?.dsa.completed ?? '…'}</strong></span>
            </div>
          </div>
          <div className={styles.dsaPct}>{dsaPct}%</div>
        </div>

        <ProgressBar value={dsaPct} gradient />
        <p className={styles.dsaCaption}>{data?.dsa.completed ?? 0} of {data?.dsa.total ?? 0} problems completed</p>
      </Card>
    </div>
  )
}
