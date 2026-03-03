/**
 * Calendar Page
 * Interactive calendar with event management
 */

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  ChevronLeft, ChevronRight, Plus, X, Loader, Trash2, Edit2, Calendar
} from 'lucide-react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths
} from 'date-fns';

const EVENT_TYPES = ['Study Session', 'Assignment', 'Exam', 'Reminder', 'Other'];
const typeColors = {
  'Study Session': '#6366f1',
  'Assignment': '#f59e0b',
  'Exam': '#ef4444',
  'Reminder': '#8b5cf6',
  'Other': '#6b7280',
};

const EventModal = ({ event, selectedDate, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event ? format(new Date(event.date), "yyyy-MM-dd'T'HH:mm") : (selectedDate ? format(selectedDate, "yyyy-MM-dd'T'09:00") : ''),
    type: event?.type || 'Study Session',
    isAllDay: event?.isAllDay || false,
    reminder: event?.reminder || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (event) res = await api.put(`/calendar/${event._id}`, form);
      else res = await api.post('/calendar', form);
      onSave(res.data, !!event);
      onClose();
    } catch (err) {
      alert('Failed to save event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'New Event'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <input className="form-input" type="text" placeholder="e.g., DSA Study Session" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required autoFocus />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input className="form-input" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={2} placeholder="Details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <Loader size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> : null}
              {event ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

  const fetchEvents = async () => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    const { data } = await api.get('/calendar', { params: { month, year } });
    setEvents(data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [currentDate]);

  const handleSave = (event, isEdit) => {
    if (isEdit) setEvents((e) => e.map((x) => (x._id === event._id ? event : x)));
    else setEvents((e) => [...e, event]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await api.delete(`/calendar/${id}`);
    setEvents((e) => e.filter((x) => x._id !== id));
    setSelectedDayEvents((e) => e.filter((x) => x._id !== id));
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setSelectedDayEvents(events.filter((e) => isSameDay(new Date(e.date), day)));
  };

  // Build calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Calendar</div>
          <div className="page-subtitle">Manage your study schedule, assignments, and exams</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setEditEvent(null); setShowModal(true); }}>
            <Plus size={15} /> Add Event
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)' }}>
        {/* Calendar */}
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          {/* Month Navigator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft size={20} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div className="cal-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="cal-header-day">{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="calendar-grid">
            {days.map((day) => {
              const dayEvents = events.filter((e) => isSameDay(new Date(e.date), day));
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              return (
                <div
                  key={day.toISOString()}
                  className={`calendar-day ${isToday(day) ? 'today' : ''} ${!isSameMonth(day, currentDate) ? 'other-month' : ''}`}
                  style={{ outline: isSelected ? '2px solid var(--color-primary)' : 'none', outlineOffset: -2 }}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="calendar-day-num">{format(day, 'd')}</div>
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div key={ev._id} className="calendar-event-dot" style={{ background: typeColors[ev.type] || '#6b7280' }} title={ev.title}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>+{dayEvents.length - 3} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div>
          {/* Legend */}
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Event Types</h3>
            {EVENT_TYPES.map((type) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: typeColors[type], flexShrink: 0 }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{type}</span>
              </div>
            ))}
          </div>

          {/* Selected Day Events */}
          {selectedDate && (
            <div className="card fade-in">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {format(selectedDate, 'MMMM d')}
                <button className="btn btn-primary btn-sm" onClick={() => { setEditEvent(null); setShowModal(true); }}>
                  <Plus size={14} />
                </button>
              </h3>
              {selectedDayEvents.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No events on this day.</p>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div key={ev._id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: typeColors[ev.type], flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{ev.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{format(new Date(ev.date), 'h:mm a')} · {ev.type}</div>
                      {ev.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{ev.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditEvent(ev); setShowModal(true); }}><Edit2 size={13} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(ev._id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <EventModal
          event={editEvent}
          selectedDate={selectedDate}
          onClose={() => { setShowModal(false); setEditEvent(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default CalendarPage;
