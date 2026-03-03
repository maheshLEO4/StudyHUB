import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Clock, CalendarDays } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { calendarAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO,
} from 'date-fns';

// ── Event type config ───────────────────────────────────────────
const EVENT_CFG = {
  Study: { color: '#3b82f6', bg: '#eff6ff', badge: 'badge-blue' },
  Assignment: { color: '#f59e0b', bg: '#fffbeb', badge: 'badge-yellow' },
  Exam: { color: '#ef4444', bg: '#fef2f2', badge: 'badge-red' },
  Reminder: { color: '#8b5cf6', bg: '#f5f3ff', badge: 'badge-purple' },
  Other: { color: '#6b7280', bg: 'var(--bg3)', badge: 'badge-gray' },
};

// ── Event Modal ─────────────────────────────────────────────────
function EventModal({ date, onClose, onSaved, toast }) {
  const [form, setForm] = useState({
    title: '', date: format(date, 'yyyy-MM-dd'),
    time: '', type: 'Study', description: '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) return toast('Title required', 'error');
    setSaving(true);
    try { await calendarAPI.create(form); toast('Event added', 'success'); onSaved(); }
    catch { toast('Error saving event', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Event — {format(date, 'MMM d, yyyy')}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input className="form-control" placeholder="Event title…" value={form.title} onChange={set('title')} autoFocus onKeyDown={(e) => e.key === 'Enter' && save()} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-control" type="date" value={form.date} onChange={set('date')} />
          </div>
          <div className="form-group">
            <label className="form-label">Time (optional)</label>
            <input className="form-control" type="time" value={form.time} onChange={set('time')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-control" value={form.type} onChange={set('type')}>
            {Object.keys(EVENT_CFG).map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" placeholder="Details…" value={form.description} onChange={set('description')} style={{ minHeight: 70 }} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Calendar Page ──────────────────────────────────────────
export default function CalendarPage() {
  const { toast } = useToast();
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await calendarAPI.getAll({ month: current.getMonth() + 1, year: current.getFullYear() });
      setEvents(r.data.data || []);
    } catch { toast('Failed to load events', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [current.getMonth(), current.getFullYear()]);

  const del = async (id) => {
    try { await calendarAPI.delete(id); toast('Event deleted', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: startOfWeek(monthStart), end: endOfWeek(monthEnd) });
  const getDay = (d) => events.filter((ev) => isSameDay(parseISO(ev.date), d));
  const selEvents = getDay(selectedDay);
  const upcoming = events.filter((ev) => ev.type === 'Exam' && new Date(ev.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

  return (
    <Layout currentPage="Calendar">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Calendar</div>
          <div className="page-subtitle">{format(current, 'MMMM yyyy')} · {events.length} event{events.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add Event
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* ── Calendar Grid ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--border)' }}>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1))}>
              <ChevronLeft size={18} />
            </button>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, textAlign: 'center', letterSpacing: '-.3px' }}>{format(current, 'MMMM')}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', fontWeight: 600 }}>{format(current, 'yyyy')}</div>
            </div>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1))}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div style={{ padding: '12px 16px 20px' }}>
            {/* Day labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text3)', padding: '6px 0', letterSpacing: '.8px' }}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {days.map((day) => {
                const dayEvs = getDay(day);
                const inMonth = isSameMonth(day, current);
                const isTodays = isToday(day);
                const isSel = isSameDay(day, selectedDay);
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 10,
                      padding: '8px 4px 6px',
                      textAlign: 'center',
                      transition: 'all .15s',
                      background: isSel ? 'var(--accent)' : isTodays ? 'var(--accent-bg)' : 'transparent',
                      opacity: inMonth ? 1 : 0.25,
                      position: 'relative',
                    }}
                  >
                    <div style={{
                      fontWeight: isSel || isTodays ? 800 : inMonth ? 500 : 400,
                      fontSize: 13.5,
                      color: isSel ? 'white' : isTodays ? 'var(--accent)' : 'var(--text)',
                      marginBottom: 4,
                      lineHeight: 1,
                    }}>
                      {format(day, 'd')}
                    </div>
                    {/* Event dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, minHeight: 6 }}>
                      {dayEvs.slice(0, 3).map((ev, i) => (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: isSel ? 'rgba(255,255,255,.7)' : EVENT_CFG[ev.type]?.color || '#6b7280',
                        }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              {Object.entries(EVENT_CFG).map(([type, { color }]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text3)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Selected day events */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-.2px' }}>
                  {isToday(selectedDay) ? 'Today' : format(selectedDay, 'EEE, MMM d')}
                </div>
                {selEvents.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{selEvents.length} event{selEvents.length !== 1 ? 's' : ''}</div>
                )}
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowModal(true)}
                style={{ gap: 5 }}
              >
                <Plus size={13} /> Event
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><span className="spinner spinner-sm" /></div>
            ) : selEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 13 }}>
                <CalendarDays size={28} style={{ margin: '0 auto 8px', opacity: .4 }} />
                No events on this day
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selEvents.map((ev) => {
                  const cfg = EVENT_CFG[ev.type] || EVENT_CFG.Other;
                  return (
                    <div
                      key={ev._id}
                      style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        padding: '10px 12px', borderRadius: 10,
                        background: cfg.bg, border: `1px solid ${cfg.color}22`,
                        borderLeft: `3px solid ${cfg.color}`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{ev.title}</div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`badge ${cfg.badge}`} style={{ fontSize: 10 }}>{ev.type}</span>
                          {ev.time && (
                            <span style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={10} /> {ev.time}
                            </span>
                          )}
                        </div>
                        {ev.description && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{ev.description}</div>}
                      </div>
                      <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => del(ev._id)} style={{ flexShrink: 0 }}><Trash2 size={12} /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Exams */}
          {upcoming.length > 0 && (
            <div className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                🎓 Upcoming Exams
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {upcoming.map((ev) => (
                  <div key={ev._id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 7, padding: '3px 8px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {format(parseISO(ev.date), 'MMM d')}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, flex: 1 }} className="truncate">{ev.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <EventModal
          date={selectedDay}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); load(); }}
          toast={toast}
        />
      )}
    </Layout>
  );
}