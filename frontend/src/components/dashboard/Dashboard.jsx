import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI, habitsAPI, todosAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../shared/Icon';
import Spinner from '../shared/Spinner';
import toast from 'react-hot-toast';

const fmtDateMonth = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }),
    day: date.getDate()
  };
};

const typeColor = { study: 'var(--blue)', exam: 'var(--red)', assignment: 'var(--yellow)', reminder: 'var(--green)' };

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    searchAPI.dashboard()
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleHabit = async (id) => {
    try {
      await habitsAPI.toggle(id);
      loadData();
      toast.success('Daily task updated');
    } catch (e) {
      toast.error('Failed to update task');
    }
  };

  const toggleTask = async (task) => {
    try {
      await todosAPI.update(task._id, { ...task, completed: true });
      loadData();
      toast.success('Task marked as complete');
    } catch (e) {
      toast.error('Failed to update task');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Spinner size={32} />
    </div>
  );

  const dsaTotal = stats?.dsa?.total || 0;
  const dsaDone = stats?.dsa?.completed || 0;
  const dsaDoing = stats?.dsa?.['in-progress'] || 0;
  const dsaTodo = stats?.dsa?.['not-started'] || 0;
  const pct = dsaTotal ? Math.round((dsaDone / dsaTotal) * 100) : 0;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const statCards = [
    { label: 'Subjects', num: stats?.subjects || 0, icon: 'book', color: 'var(--purple)', path: '/subjects' },
    { label: 'Tasks', num: stats?.pendingTasks?.count || 0, icon: 'edit', color: 'var(--yellow)', path: '/todos' },
    { label: 'DSA Solved', num: `${dsaDone}/${dsaTotal}`, icon: 'code', color: 'var(--green)', path: '/dsa' },
    { label: 'Saved Links', num: stats?.links || 0, icon: 'link', color: 'var(--red)', path: '/links' },
  ];

  return (
    <div className="dashboard-root" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      padding: '0 4px',
      overflow: 'hidden'
    }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>{today}</p>
        </div>
      </div>

      {/* Top 4 Stat Cards - Compact */}
      <div className="grid-4" style={{ gap: 12, flexShrink: 0 }}>
        {statCards.map((s) => (
          <div key={s.label} className="card card-hover" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate(s.path)}>
            <div>
              <div style={{ color: 'var(--text3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{s.num}</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '15', color: s.color, display: 'grid', placeItems: 'center' }}>
              <Icon name={s.icon} size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid - Flexible height */}
      <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          {/* Upcoming - Clickable Header */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => navigate('/calendar')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 13 }}>
                <Icon name="calendar" size={14} /> Upcoming Events
              </div>
              <Icon name="chevronRight" size={14} style={{ opacity: 0.5 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
              {(stats?.upcomingEvents || []).length === 0
                ? <div style={{ textAlign: 'center', padding: '10px 0', opacity: 0.5 }}>
                  <div style={{ fontSize: 11 }}>No upcoming events</div>
                </div>
                : (stats.upcomingEvents.slice(0, 3)).map(ev => {
                  const date = fmtDateMonth(ev.date);
                  return (
                    <div key={ev._id} className="flex gap-3 mb-4 last:mb-0">
                      <div style={{ textAlign: 'center', minWidth: 24 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>{date.month}</div>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>{date.day}</div>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="truncate" style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{ev.title}</div>
                        <span className="badge" style={{ background: typeColor[ev.type] + '20', color: typeColor[ev.type], borderRadius: 4, padding: '1px 8px', fontSize: 8 }}>
                          {ev.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Daily Tasks - Clickable Header */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => navigate('/habits')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 13 }}>
                <Icon name="fire" size={14} /> Daily Tasks
              </div>
              <Icon name="chevronRight" size={14} style={{ opacity: 0.5 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
              {!stats?.habits?.list?.length
                ? <div style={{ textAlign: 'center', padding: '10px 0', opacity: 0.5, fontSize: 11 }}>No tasks set</div>
                : (stats.habits.list.slice(0, 4)).map(h => (
                  <div key={h._id} className="flex items-center gap-3 mb-2 p-1.5 rounded-lg hover:bg-[var(--bg2)] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleHabit(h._id); }}>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      border: '2px solid ' + (h.completedToday ? 'var(--green)' : 'var(--border)'),
                      background: h.completedToday ? 'var(--green)' : 'transparent',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      {h.completedToday && <Icon name="check" size={10} />}
                    </div>
                    <span className="truncate" style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: h.completedToday ? 'var(--text3)' : 'var(--text)',
                      textDecoration: h.completedToday ? 'line-through' : 'none'
                    }}>{h.name}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0 }}>
          {/* Pending Tasks - Clickable Header */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => navigate('/todos')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 13 }}>
                <Icon name="check" size={14} /> Pending Tasks
              </div>
              <Icon name="chevronRight" size={14} style={{ opacity: 0.5 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
              {!stats?.pendingTasks?.list?.length
                ? <div style={{ textAlign: 'center', padding: '20px 0', opacity: 0.5 }}>
                  <div style={{ fontSize: 11 }}>All caught up! 🎉</div>
                </div>
                : stats.pendingTasks.list.slice(0, 5).map(t => (
                  <div key={t._id} className="flex items-start gap-3 mb-2 p-1.5 rounded-lg hover:bg-[var(--bg2)] transition-colors">
                    <div
                      onClick={(e) => { e.stopPropagation(); toggleTask(t); }}
                      style={{
                        marginTop: 2,
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        border: '2px solid var(--border)',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="truncate" style={{ fontSize: 12, fontWeight: 600 }}>{t.text}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Recent Notes - Clickable Header */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => navigate('/subjects')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 13 }}>
                <Icon name="star" size={14} /> Recent Notes
              </div>
              <Icon name="chevronRight" size={14} style={{ opacity: 0.5 }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
              {(stats?.recentNotes || []).length === 0
                ? <div style={{ textAlign: 'center', padding: '10px 0', opacity: 0.5, fontSize: 11 }}>No notes yet</div>
                : (stats.recentNotes.slice(0, 3)).map(note => (
                  <div key={note._id} className="mb-3 last:mb-0 pb-3 last:pb-0" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: note.subject?.color || 'var(--accent)', flexShrink: 0 }} />
                      <div className="truncate" style={{ fontSize: 12, fontWeight: 600 }}>{note.title}</div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                      {note.subject?.name} • {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom DSA Tracker - Compact */}
      <div className="card" style={{ padding: '16px 20px', flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/dsa')}>
        <div className="flex items-center justify-between mb-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 13 }}>
            <Icon name="activity" size={14} /> DSA Progress
          </div>
          <Icon name="chevronRight" size={14} style={{ opacity: 0.5 }} />
        </div>

        <div className="flex items-end justify-between mb-2">
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>{dsaDone} of {dsaTotal} solved</div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{pct}%</span>
        </div>

        <div className="progress-bar" style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10 }}>
          <div className="progress-fill" style={{ width: pct + '%', background: 'var(--accent)', borderRadius: 10 }} />
        </div>

        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-2">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b' }} />
            <span style={{ fontSize: 10, color: 'var(--text2)' }}>To-do: <strong>{dsaTodo}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--yellow)' }} />
            <span style={{ fontSize: 10, color: 'var(--text2)' }}>Doing: <strong>{dsaDoing}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ fontSize: 10, color: 'var(--text2)' }}>Done: <strong>{dsaDone}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
