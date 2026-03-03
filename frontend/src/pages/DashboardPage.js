import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckSquare, Code2, Link2, Calendar, TrendingUp, Clock, Star, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { subjectsAPI, tasksAPI, dsaAPI, linksAPI, calendarAPI, notesAPI, habitsAPI } from '../utils/api';
import { format, isToday, isFuture } from 'date-fns';

function StatCard({ label, value, icon: Icon, color, bg, onClick }) {
  return (
    <div className="stat-card" onClick={onClick}>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ color: color }}>{value}</div>
      </div>
      <div className="stat-icon-wrapper" style={{ background: bg, color }}>
        <Icon size={24} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ subjects: [], tasks: [], dsa: null, links: [], events: [], notes: [], habits: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, d, l, e, n, h] = await Promise.all([
          subjectsAPI.getAll(), tasksAPI.getAll({ completed: false }),
          dsaAPI.getStats(), linksAPI.getAll(),
          calendarAPI.getUpcoming(5), notesAPI.getAll(),
          habitsAPI.getAll()
        ]);
        setData({
          subjects: s.data.data || [],
          tasks: t.data.data || [],
          dsa: d.data.data || null,
          links: l.data.data || [],
          events: e.data.data || [],
          notes: n.data.data || [],
          habits: h.data.data || []
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const eventTypeColor = { Exam: 'badge-red', Assignment: 'badge-yellow', Study: 'badge-blue', Reminder: 'badge-purple', Other: 'badge-gray' };

  if (loading) return (
    <Layout currentPage="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><span className="spinner spinner-lg" /></div>
    </Layout>
  );

  const { subjects, tasks, dsa, links, events, notes, habits } = data;
  const todayStr = new Date().toISOString().split('T')[0];
  const completedHabits = habits.filter(h => h.completedDates.includes(todayStr));
  const recentNotes = [...notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <Layout currentPage="Dashboard">
      {/* ── Header Area ────────────────────────── */}
      <div className="dashboard-header mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {getGreeting()}, <span style={{ color: 'var(--color-primary)' }}>{user?.name?.split(' ')[0]}</span> 👋
          </h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/calendar')}>
            <Calendar size={14} /> Schedule
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/tasks')}>
            <CheckSquare size={14} /> Tasks
          </button>
        </div>
      </div>

      {/* ── Main Stats ─────────────────────────── */}
      <div className="grid-5 mb-4">
        <StatCard label="Subjects" value={subjects.length} icon={BookOpen} color="#6366f1" bg="rgba(99, 102, 241, 0.1)" onClick={() => navigate('/subjects')} />
        <StatCard label="Tasks" value={tasks.length} icon={CheckSquare} color="#f59e0b" bg="rgba(245, 158, 11, 0.1)" onClick={() => navigate('/tasks')} />
        <StatCard label="Habits" value={`${completedHabits.length}/${habits.length}`} icon={Flame} color="#f97316" bg="rgba(249, 115, 22, 0.1)" onClick={() => navigate('/habits')} />
        <StatCard label="DSA" value={dsa ? `${dsa.completed}/${dsa.total}` : '0/0'} icon={Code2} color="#10b981" bg="rgba(16, 185, 129, 0.1)" onClick={() => navigate('/dsa')} />
        <StatCard label="Links" value={links.length} icon={Link2} color="#ef4444" bg="rgba(239, 68, 68, 0.1)" onClick={() => navigate('/links')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column: DSA & Habits ──────────── */}
        <div className="lg:col-span-2 space-y-4">
          {/* DSA Progress section */}
          {dsa && dsa.total > 0 && (
            <div className="card glass-card py-3">
              <div className="flex items-center justify-between mb-3">
                <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="icon-box" style={{ width: 30, height: 30, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}><TrendingUp size={16} /></div>
                  DSA Progress
                </div>
                <span className="badge badge-primary px-2 py-0.5 text-[10px]">{Math.round((dsa.completed / dsa.total) * 100)}%</span>
              </div>

              <div className="progress-container mb-3">
                <div className="progress-bar h-2">
                  <div className="progress-fill glow-effect" style={{ width: `${(dsa.completed / dsa.total) * 100}%`, background: 'linear-gradient(90deg, var(--color-primary), #a855f7)' }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="mini-stat py-1">
                  <span className="mini-label text-[9px]">Todo</span>
                  <span className="mini-value text-sm text-tertiary">{dsa.notStarted}</span>
                </div>
                <div className="mini-stat py-1">
                  <span className="mini-label text-[9px]">Doing</span>
                  <span className="mini-value text-sm text-warning">{dsa.inProgress}</span>
                </div>
                <div className="mini-stat py-1">
                  <span className="mini-label text-[9px]">Done</span>
                  <span className="mini-value text-sm text-success">{dsa.completed}</span>
                </div>
              </div>
            </div>
          )}

          {/* Daily Habits section */}
          <div className="card glass-card py-3">
            <div className="flex items-center justify-between mb-3">
              <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="icon-box" style={{ width: 30, height: 30, background: 'rgba(249, 115, 22, 0.1)', color: '#f97316' }}><Flame size={16} /></div>
                Habits
              </div>
              <button className="btn btn-ghost btn-sm text-[10px]" onClick={() => navigate('/habits')}>Config</button>
            </div>

            {habits.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-tertiary text-[11px] italic">Build your rituals.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="progress-container">
                  <div className="progress-bar h-1.5">
                    <div className="progress-fill" style={{
                      width: `${(completedHabits.length / habits.length) * 100}%`,
                      background: 'linear-gradient(90deg, #f97316, #ef4444)'
                    }} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {habits.slice(0, 4).map(h => {
                    const isDone = h.completedDates.includes(todayStr);
                    return (
                      <div key={h._id} className={`habit-pill py-2 px-3 ${isDone ? 'active' : ''}`}>
                        <span className="habit-icon text-sm">{h.icon}</span>
                        <span className="habit-name truncate text-[11px]">{h.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pending Tasks */}
            <div className="card py-4">
              <div className="flex items-center justify-between mb-3">
                <div style={{ fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckSquare size={14} className="text-warning" /> Tasks
                </div>
              </div>
              {tasks.length === 0 ? (
                <p className="text-tertiary text-xs italic">All clear.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 3).map(t => (
                    <div key={t._id} className="task-item-compact py-1">
                      <div className={`priority-line priority-${t.priority}`} style={{ height: 12 }} />
                      <span className="flex-1 truncate text-xs font-medium">{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Notes */}
            <div className="card py-4">
              <div className="flex items-center justify-between mb-3">
                <div style={{ fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Star size={14} className="text-purple" /> Notes
                </div>
              </div>
              {recentNotes.length === 0 ? (
                <p className="text-tertiary text-xs italic">Empty...</p>
              ) : (
                <div className="space-y-2">
                  {recentNotes.slice(0, 3).map(n => (
                    <div key={n._id} className="note-card-compact p-2">
                      <span className="flex-1 truncate text-xs font-bold">{n.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Calendar & Timeline ──── */}
        <div className="space-y-4">
          <div className="card glass-card h-full py-3">
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="icon-box" style={{ width: 30, height: 30, background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}><Calendar size={16} /></div>
                Horizon
              </div>
              <button className="btn btn-ghost btn-sm text-[10px]" onClick={() => navigate('/calendar')}>View</button>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-tertiary text-xs">No events.</p>
              </div>
            ) : (
              <div className="timeline-container relative">
                <div className="timeline-line" />
                <div className="space-y-4">
                  {events.slice(0, 4).map((ev, idx) => (
                    <div key={ev._id} className="timeline-event relative pl-6">
                      <div className="timeline-dot" style={{ top: 4 }} />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-secondary tracking-widest">{format(new Date(ev.date), 'MMM d')}</span>
                        <span className="text-xs font-extrabold mt-0.5">{ev.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}