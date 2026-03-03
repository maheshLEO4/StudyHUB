import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, CheckSquare, Code2, Link2, Calendar,
  TrendingUp, Flame, ChevronRight, CheckCircle, Circle,
  ArrowUpRight, Zap, FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { subjectsAPI, tasksAPI, dsaAPI, linksAPI, calendarAPI, notesAPI, habitsAPI } from '../utils/api';
import { format } from 'date-fns';

// ── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all .2s',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Accent glow */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 14px 0 80px', background: accent, opacity: .12 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, opacity: .18, display: 'grid', placeItems: 'center' }} />
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: 'white', position: 'absolute' }}>
          <Icon size={17} />
        </div>
        <ArrowUpRight size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text3)', fontWeight: 600, marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────
function SectionHead({ icon: Icon, title, count, accent, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: accent, display: 'grid', placeItems: 'center', color: 'white' }}>
          <Icon size={13} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {count !== undefined && <span style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>{count}</span>}
        {onClick && <ChevronRight size={12} style={{ color: 'var(--text3)' }} />}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ subjects: [], tasks: [], dsa: null, links: [], events: [], notes: [], habits: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, t, d, l, e, n, h] = await Promise.all([
          subjectsAPI.getAll(), tasksAPI.getAll({ completed: false }),
          dsaAPI.getStats(), linksAPI.getAll(),
          calendarAPI.getUpcoming(5), notesAPI.getAll(),
          habitsAPI.getAll(),
        ]);
        setData({
          subjects: s.data.data || [], tasks: t.data.data || [],
          dsa: d.data.data || null, links: l.data.data || [],
          events: e.data.data || [], notes: n.data.data || [],
          habits: h.data.data || [],
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const EVENT_COLOR = { Exam: '#ef4444', Assignment: '#f59e0b', Study: '#3b82f6', Reminder: '#8b5cf6', Other: '#6b7280' };

  if (loading) return (
    <Layout currentPage="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <span className="spinner spinner-lg" />
      </div>
    </Layout>
  );

  const { subjects, tasks, dsa, links, notes, habits, events } = data;
  const todayStr = new Date().toISOString().split('T')[0];
  const doneHabits = habits.filter(h => h.completedDates.includes(todayStr));
  const dsaPct = dsa && dsa.total > 0 ? Math.round((dsa.completed / dsa.total) * 100) : 0;

  return (
    <Layout currentPage="Dashboard">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>

        {/* ── Greeting ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-.4px', margin: 0 }}>
              {greeting()}, <span style={{ color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text3)', margin: '2px 0 0', fontWeight: 500 }}>
              {format(new Date(), 'EEEE, MMMM do')} · Here's your overview
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {dsa && dsa.total > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 12px' }}>
                <Zap size={12} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>DSA {dsaPct}%</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 12px' }}>
              <Flame size={12} style={{ color: '#f97316' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>{doneHabits.length}/{habits.length} tasks</span>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, flexShrink: 0 }}>
          <StatCard label="Subjects" value={subjects.length} icon={BookOpen} accent="#6366f1" onClick={() => navigate('/subjects')} />
          <StatCard label="Pending Tasks" value={tasks.length} icon={CheckSquare} accent="#f59e0b" onClick={() => navigate('/tasks')} />
          <StatCard label="Daily Tasks" value={`${doneHabits.length}/${habits.length}`} sub="completed today" icon={Flame} accent="#f97316" onClick={() => navigate('/habits')} />
          <StatCard label="DSA Solved" value={dsa ? `${dsa.completed}/${dsa.total}` : '0/0'} icon={Code2} accent="#10b981" onClick={() => navigate('/dsa')} />
          <StatCard label="Links Saved" value={links.length} icon={Link2} accent="#8b5cf6" onClick={() => navigate('/links')} />
        </div>

        {/* ── Main Content ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 12, flex: 1, minHeight: 0 }}>

          {/* ── Column 1: Tasks + DSA ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

            {/* Pending Tasks */}
            <div
              onClick={() => navigate('/tasks')}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, cursor: 'pointer' }}
            >
              <SectionHead icon={CheckSquare} title="Pending Tasks" accent="#f59e0b" />
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 12 }}>
                    <CheckCircle size={24} style={{ margin: '0 auto 6px', opacity: .3 }} />
                    All clear!
                  </div>
                ) : tasks.slice(0, 8).map(t => (
                  <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: 'var(--bg2)', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
                  >
                    <Circle size={13} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                    <span style={{ fontSize: 12.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{t.title}</span>
                    {t.priority && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 20, background: t.priority === 'High' ? 'var(--red-bg)' : t.priority === 'Medium' ? 'var(--yellow-bg)' : 'var(--green-bg)', color: t.priority === 'High' ? 'var(--red)' : t.priority === 'Medium' ? 'var(--yellow)' : 'var(--green)', flexShrink: 0 }}>
                        {t.priority}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DSA Progress */}
            {dsa && dsa.total > 0 && (
              <div
                onClick={() => navigate('/dsa')}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', flexShrink: 0 }}
              >
                <SectionHead icon={Code2} title="DSA Progress" accent="#10b981" />
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ height: '100%', width: `${dsaPct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 6, transition: 'width .6s ease' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { label: 'To Do', val: dsa.notStarted, color: 'var(--text3)' },
                    { label: 'Doing', val: dsa.inProgress, color: 'var(--yellow)' },
                    { label: 'Done', val: dsa.completed, color: 'var(--green)' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '6px', background: 'var(--bg2)', borderRadius: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color }}>{val}</div>
                      <div style={{ fontSize: 9, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Column 2: Notes ── */}
          <div
            onClick={() => navigate('/subjects')}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', minHeight: 0, cursor: 'pointer' }}
          >
            <SectionHead icon={FileText} title="Quick Notes" accent="#6366f1" />
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {notes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 12 }}>
                  <FileText size={24} style={{ margin: '0 auto 6px', opacity: .3 }} />
                  No notes yet
                </div>
              ) : notes.slice(0, 12).map(n => (
                <div key={n._id} style={{ padding: '7px 10px', borderRadius: 8, background: 'var(--bg2)', borderLeft: '3px solid var(--accent)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                  {n.subject && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{n.subject}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Column 3: Upcoming + Daily Tasks ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>

            {/* Upcoming Events */}
            <div
              onClick={() => navigate('/calendar')}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, cursor: 'pointer' }}
            >
              <SectionHead icon={Calendar} title="Upcoming" accent="#3b82f6" />
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {events.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text3)', fontSize: 12 }}>
                    <Calendar size={24} style={{ margin: '0 auto 6px', opacity: .3 }} />
                    No upcoming events
                  </div>
                ) : events.slice(0, 6).map(ev => (
                  <div key={ev._id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 8px', borderRadius: 8, background: 'var(--bg2)' }}>
                    <div style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: EVENT_COLOR[ev.type] || '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px' }}>{format(new Date(ev.date), 'MMM')}</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)', lineHeight: 1.1 }}>{format(new Date(ev.date), 'd')}</div>
                    </div>
                    <div style={{ width: 2, height: 30, borderRadius: 2, background: EVENT_COLOR[ev.type] || '#6b7280', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                      <div style={{ fontSize: 9.5, color: 'var(--text3)', marginTop: 1 }}>{ev.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Tasks */}
            <div
              onClick={() => navigate('/habits')}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', flexShrink: 0, cursor: 'pointer' }}
            >
              <SectionHead icon={Flame} title="Daily Tasks" accent="#f97316" />
              {habits.length === 0 ? (
                <div style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', padding: '8px 0' }}>No daily tasks set</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {habits.slice(0, 5).map(h => {
                    const done = h.completedDates.includes(todayStr);
                    return (
                      <div key={h._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 7, background: done ? 'rgba(16,185,129,.08)' : 'var(--bg2)', border: `1px solid ${done ? 'rgba(16,185,129,.2)' : 'transparent'}` }}>
                        {done
                          ? <CheckCircle size={14} style={{ color: 'var(--green)', flexShrink: 0 }} />
                          : <Circle size={14} style={{ color: 'var(--text3)', flexShrink: 0 }} />
                        }
                        <span style={{ fontSize: 11.5, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text3)' : 'var(--text)' }}>{h.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
