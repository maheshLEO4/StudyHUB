import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import Layout from "../components/layout/Layout";
import { calendarAPI } from "../utils/api";
import { useToast } from "../context/ToastContext";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from "date-fns";

const EVENT_COLORS = { Exam: "#ef4444", Assignment: "#f59e0b", Study: "#3b82f6", Reminder: "#8b5cf6", Other: "#6b7280" };
const EVENT_BADGES = { Exam: "badge-red", Assignment: "badge-yellow", Study: "badge-blue", Reminder: "badge-purple", Other: "badge-gray" };

function EventModal({ date, onClose, onSaved, toast }) {
  const [form, setForm] = useState({ title: "", date: format(date, "yyyy-MM-dd"), time: "", type: "Study", description: "" });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) return toast("Title required", "error");
    setSaving(true);
    try { await calendarAPI.create(form); toast("Event added", "success"); onSaved(); }
    catch { toast("Error", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Add Event — {format(date, "MMM d, yyyy")}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="form-group"><label className="form-label">Title</label>
          <input className="form-control" placeholder="Event title..." value={form.title} onChange={set("title")} />
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Date</label>
            <input className="form-control" type="date" value={form.date} onChange={set("date")} />
          </div>
          <div className="form-group"><label className="form-label">Time (optional)</label>
            <input className="form-control" type="time" value={form.time} onChange={set("time")} />
          </div>
        </div>
        <div className="form-group"><label className="form-label">Type</label>
          <select className="form-control" value={form.type} onChange={set("type")}>
            <option>Study</option><option>Assignment</option><option>Exam</option><option>Reminder</option><option>Other</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Description</label>
          <textarea className="form-control" placeholder="Details..." value={form.description} onChange={set("description")} style={{ minHeight: 70 }} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <span className="spinner spinner-sm" /> : "Add Event"}</button>
        </div>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const { toast } = useToast();
  const [current, setCurrent] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const r = await calendarAPI.getAll({ month: current.getMonth() + 1, year: current.getFullYear() });
      setEvents(r.data.data || []);
    } catch { toast("Failed to load events", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadEvents(); }, [current.getMonth(), current.getFullYear()]);

  const deleteEvent = async (id) => {
    try { await calendarAPI.delete(id); toast("Event deleted", "success"); loadEvents(); }
    catch { toast("Error", "error"); }
  };

  // Build calendar grid
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = day => events.filter(ev => isSameDay(parseISO(ev.date), day));
  const selectedEvents = getEventsForDay(selectedDay);

  return (
    <Layout currentPage="Calendar">
      <div className="section-header">
        <div className="section-title">Calendar</div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> Add Event</button>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: "start" }}>
        {/* Calendar grid */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1))}><ChevronLeft size={18} /></button>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{format(current, "MMMM yyyy")}</div>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1))}><ChevronRight size={18} /></button>
          </div>

          {/* Day labels */}
          <div className="cal-grid mb-1">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="cal-day-label">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="cal-grid">
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, current);
              const isSelected = isSameDay(day, selectedDay);
              const isTodays = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`cal-cell ${!isCurrentMonth ? "other-month" : ""} ${isTodays ? "today" : ""} ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {format(day, "d")}
                  {dayEvents.length > 0 && (
                    <div className="cal-dots">
                      {dayEvents.slice(0, 3).map((ev, i) => (
                        <div key={i} className="cal-dot" style={{ background: isSelected ? "white" : EVENT_COLORS[ev.type] || "#6b7280" }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-3 mt-4 flex-wrap" style={{ fontSize: 11 }}>
            {Object.entries(EVENT_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ color: "var(--text3)" }}>{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day detail panel */}
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 14 }}>
            {isToday(selectedDay) ? "Today" : format(selectedDay, "EEEE, MMMM d")}
          </div>
          {loading ? <span className="spinner spinner-sm" />
            : selectedEvents.length === 0 ? (
              <div style={{ color: "var(--text3)", fontSize: 13, padding: "20px 0" }}>No events on this day. Click "Add Event" to create one.</div>
            ) : selectedEvents.map(ev => (
              <div key={ev._id} className="card-sm flex items-start gap-3 mb-3" style={{ borderLeft: `3px solid ${EVENT_COLORS[ev.type]}` }}>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{ev.title}</span>
                    <span className={`badge ${EVENT_BADGES[ev.type]}`}>{ev.type}</span>
                  </div>
                  {ev.time && <div style={{ fontSize: 12, color: "var(--text3)" }}>⏰ {ev.time}</div>}
                  {ev.description && <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>{ev.description}</div>}
                </div>
                <button className="btn btn-ghost btn-icon-sm btn-danger" onClick={() => deleteEvent(ev._id)}><Trash2 size={13} /></button>
              </div>
            ))}

          <div style={{ marginTop: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "var(--text2)" }}>Upcoming Exams</div>
            {events.filter(ev => ev.type === "Exam" && new Date(ev.date) >= new Date()).sort((a,b) => new Date(a.date)-new Date(b.date)).slice(0, 5).map(ev => (
              <div key={ev._id} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "center" }}>
                <div style={{ background: "var(--danger-bg)", color: "var(--danger)", borderRadius: 8, padding: "4px 8px", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{format(parseISO(ev.date), "MMM d")}</div>
                <div style={{ fontSize: 13, flex: 1 }} className="truncate">{ev.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && <EventModal date={selectedDay} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadEvents(); }} toast={toast} />}
    </Layout>
  );
}