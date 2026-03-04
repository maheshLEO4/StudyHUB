import React, { useState, useEffect, useCallback } from 'react';
import { eventsAPI } from '../../services/api';
import { useApi } from '../../hooks/useApi';
import Icon from '../shared/Icon';
import Modal from '../shared/Modal';
import Spinner from '../shared/Spinner';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const TYPE_COLOR = { study: 'var(--blue)', exam: 'var(--red)', assignment: 'var(--yellow)', reminder: 'var(--green)' };
const today = () => new Date().toISOString().slice(0, 10);

const CalendarPage = () => {
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', date: today(), time: '', type: 'study' });
  const { execute, loading: saving } = useApi();

  const year = current.getFullYear();
  const month = current.getMonth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await eventsAPI.getAll({ from: `${year}-01-01`, to: `${year}-12-31` });
      setEvents(data.data);
    } finally { setLoading(false); }
  }, [year]);
  useEffect(() => { load(); }, [load]);

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, other: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, other: false });
  while (cells.length < 42) cells.push({ day: cells.length - daysInMonth - firstDay + 1, other: true });

  const dateStr = (d, other) => {
    let m = month, y = year;
    if (other) {
      if (d > 15) { m = month - 1; if (m < 0) { m = 11; y--; } }
      else { m = month + 1; if (m > 11) { m = 0; y++; } }
    }
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const todayStr = today();
  const selStr = selected ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selected).padStart(2, '0')}` : null;
  const selEvents = selStr ? events.filter(e => e.date === selStr) : [];

  const saveEvent = async () => {
    if (!form.title.trim() || !form.date) return;
    if (editing) {
      const r = await execute(() => eventsAPI.update(editing._id, form), { successMsg: 'Event updated' });
      setEvents(prev => prev.map(e => e._id === editing._id ? r : e));
    } else {
      const r = await execute(() => eventsAPI.create(form), { successMsg: 'Event created' });
      setEvents(prev => [...prev, r]);
    }
    setShowModal(false);
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await execute(() => eventsAPI.delete(id), { successMsg: 'Event deleted' });
    setEvents(prev => prev.filter(e => e._id !== id));
  };

  const fmtDate = (d) => {
    if (!d) return '';
    const datePart = typeof d === 'string' ? d.split('T')[0] : d.toISOString().split('T')[0];
    return new Date(datePart + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const upcoming = events.filter(e => e.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Calendar</div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setForm({ title: '', description: '', date: selStr || today(), time: '', type: 'study' }); setEditing(null); setShowModal(true); }}><Icon name="plus" size={15} />Add Event</button>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Calendar */}
        <div className="card" style={{ padding: 20 }}>
          <div className="flex items-center justify-between mb-4">
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setCurrent(new Date(year, month - 1, 1))}><Icon name="chevronLeft" size={16} /></button>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{MONTHS[month]} {year}</div>
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setCurrent(new Date(year, month + 1, 1))}><Icon name="chevronRight" size={16} /></button>
          </div>
          <div className="cal-day-names">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="cal-day-name">{d}</div>)}
          </div>
          {loading ? <div style={{ textAlign: 'center', padding: 20 }}><Spinner size={24} /></div> :
            <div className="cal-grid">
              {cells.map((cell, i) => {
                const ds = !cell.other ? `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}` : null;
                const hasEv = ds && events.some(e => e.date === ds);
                const isToday = ds === todayStr;
                const isSel = !cell.other && cell.day === selected;
                return (
                  <div key={i} className={`cal-day ${cell.other ? 'cal-day--other' : ''} ${isToday ? 'cal-day--today' : ''} ${hasEv ? 'cal-day--has-events' : ''} ${isSel ? 'cal-day--selected' : ''}`}
                    onClick={() => !cell.other && setSelected(cell.day === selected ? null : cell.day)}>
                    {cell.day}
                  </div>
                );
              })}
            </div>}
        </div>

        {/* Events panel */}
        <div>
          {selected ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{MONTHS[month]} {selected}, {year}</div>
              {selEvents.length === 0
                ? <div className="text-sm text-muted card-sm">No events — click Add Event to create one.</div>
                : selEvents.map(ev => (
                  <div key={ev._id} className="card-sm mb-3 flex items-start gap-3" style={{ borderLeft: `3px solid ${TYPE_COLOR[ev.type]}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{ev.title}</div>
                      <div className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>{ev.type}{ev.time && ' · ' + ev.time}</div>
                      {ev.description && <div className="text-sm mt-2">{ev.description}</div>}
                    </div>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { setForm({ title: ev.title, description: ev.description || '', date: ev.date, time: ev.time || '', type: ev.type }); setEditing(ev); setShowModal(true); }}><Icon name="edit" size={12} /></button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => deleteEvent(ev._id)}><Icon name="trash" size={12} /></button>
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Upcoming Events</div>
              {upcoming.length === 0
                ? <div className="text-sm text-muted">No upcoming events scheduled.</div>
                : upcoming.map(ev => (
                  <div key={ev._id} className="card-sm mb-2 flex items-center gap-3" style={{ borderLeft: `3px solid ${TYPE_COLOR[ev.type]}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.title}</div>
                      <div className="text-xs text-muted">{fmtDate(ev.date)} · <span style={{ textTransform: 'capitalize' }}>{ev.type}</span></div>
                    </div>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => deleteEvent(ev._id)}><Icon name="trash" size={12} /></button>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Event' : 'Add Event'} onClose={() => setShowModal(false)}>
          <div className="form-group"><label className="form-label">Title *</label><input className="form-control" placeholder="Event title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus /></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Date *</label><input className="form-control" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Time (optional)</label><input className="form-control" type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Type</label><select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}><option value="study">Study</option><option value="exam">Exam</option><option value="assignment">Assignment</option><option value="reminder">Reminder</option></select></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" style={{ minHeight: 70 }} placeholder="Details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEvent} disabled={saving}>{saving ? <Spinner size={15} /> : 'Save Event'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default CalendarPage;
