import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO, addMonths, subMonths } from 'date-fns'
import { CalendarAPI } from '@/lib/supabase'
import { Button, Card, Modal, Input, Select, Textarea, EmptyState, Skeleton } from '@/components/ui'
import styles from '@/styles/CalendarPage.module.css'

const EVENT_TYPES = ['Study', 'Assignment', 'Exam', 'Reminder', 'Other']
const TYPE_COLORS = { Study: '#7c6af7', Assignment: '#f5c542', Exam: '#f06a6a', Reminder: '#52d68a', Other: '#8b8a95' }

const todayStr = () => format(new Date(), 'yyyy-MM-dd')

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', date: todayStr(), time: '', type: 'Study', description: '' })

  const load = () => CalendarAPI.list().then(setEvents).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openAdd = (date) => {
    setSelectedDate(date)
    setForm({ title: '', date: format(date, 'yyyy-MM-dd'), time: '', type: 'Study', description: '' })
    setModal(true)
  }

  const save = async () => {
    if (!form.title.trim() || !form.date) return
    await CalendarAPI.create({ title: form.title, date: form.date, time: form.time || null, type: form.type, description: form.description || null })
    setModal(false)
    load()
  }

  const del = async (id) => {
    await CalendarAPI.delete(id)
    load()
  }

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart) // 0=Sun

  const getEventsForDay = (day) =>
    events.filter(e => { try { return isSameDay(parseISO(e.date), day) } catch { return false } })

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : []
  const today = new Date()

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Calendar</h1>
          <p className={styles.subtitle}>{events.length} events</p>
        </div>
        <Button onClick={() => openAdd(new Date())}><Plus size={14} /> Add Event</Button>
      </div>

      <div className={styles.layout}>
        {/* Calendar grid */}
        <Card className={styles.calCard}>
          <div className={styles.calHeader}>
            <h2 className={styles.monthLabel}>{format(currentMonth, 'MMMM yyyy')}</h2>
            <div className={styles.calNav}>
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={15} /></Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={15} /></Button>
            </div>
          </div>

          <div className={styles.weekRow}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className={styles.weekDay}>{d}</div>
            ))}
          </div>

          {loading ? (
            <div className={styles.calLoading}>
              <Skeleton height={200} borderRadius={8} />
            </div>
          ) : (
            <div className={styles.dayGrid}>
              {[...Array(startPad)].map((_, i) => <div key={`pad-${i}`} />)}
              {days.map(day => {
                const dayEvents = getEventsForDay(day)
                const isToday = isSameDay(day, today)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                return (
                  <button
                    key={day.toISOString()}
                    className={`${styles.dayCell} ${isSelected ? styles.dayCellSelected : ''}`}
                    style={{ outline: isToday ? '2px solid var(--accent)' : 'none', outlineOffset: 2 }}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className={`${styles.dayNum} ${isToday ? styles.dayNumToday : ''}`}>
                      {format(day, 'd')}
                    </span>
                    <div className={styles.eventDots}>
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className={styles.dot} style={{ background: TYPE_COLORS[ev.type] || '#8b8a95' }} />
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        {/* Day panel */}
        <Card className={styles.dayPanel}>
          <h3 className={styles.dayPanelTitle}>
            {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a day'}
          </h3>

          {selectedDate && (
            <Button style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }} onClick={() => openAdd(selectedDate)}>
              <Plus size={13} /> Add Event
            </Button>
          )}

          {selectedDayEvents.length === 0 ? (
            <p className={styles.dayEmpty}>{selectedDate ? 'No events this day' : 'Click a date'}</p>
          ) : (
            <div className={styles.dayEvents}>
              {selectedDayEvents.map(ev => (
                <div key={ev.id} className={styles.dayEventItem}>
                  <div className={styles.eventDotLg} style={{ background: TYPE_COLORS[ev.type] }} />
                  <div className={styles.eventBody}>
                    <p className={styles.eventTitle}>{ev.title}</p>
                    <div className={styles.eventMeta}>
                      <span className={styles.eventTypeBadge} style={{ background: TYPE_COLORS[ev.type] + '20', color: TYPE_COLORS[ev.type] }}>{ev.type}</span>
                      {ev.time && <span className={styles.eventTime}>{ev.time}</span>}
                    </div>
                    {ev.description && <p className={styles.eventDesc}>{ev.description}</p>}
                  </div>
                  <Button variant="danger" size="sm" onClick={() => del(ev.id)} style={{ flexShrink: 0, padding: '4px 6px' }}>
                    <Trash2 size={11} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming exams */}
          <div className={styles.upcomingSection}>
            <p className={styles.upcomingLabel}>Upcoming Exams</p>
            {events.filter(e => e.type === 'Exam' && e.date >= todayStr()).slice(0, 4).map(ev => (
              <div key={ev.id} className={styles.upcomingItem}>
                <div className={styles.upcomingDot} />
                <span className={styles.upcomingTitle}>{ev.title}</span>
                <span className={styles.upcomingDate}>{format(parseISO(ev.date), 'MMM d')}</span>
              </div>
            ))}
            {events.filter(e => e.type === 'Exam').length === 0 && (
              <p className={styles.upcomingEmpty}>No exams scheduled</p>
            )}
          </div>
        </Card>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Event">
        <div className={styles.formGrid}>
          <Input label="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" />
          <div className={styles.row2}>
            <Input label="Date *" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Textarea label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional details…" rows={2} />
        </div>
        <div className={styles.modalFooter}>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
          <Button onClick={save}>Add Event</Button>
        </div>
      </Modal>
    </div>
  )
}
