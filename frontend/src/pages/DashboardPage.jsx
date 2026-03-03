/**
 * Dashboard Page
 * Overview of upcoming events, pending tasks, and recent content
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Calendar, CheckSquare, BookOpen, Link2, Code2, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ events: [], todos: [], subjects: [], dsaStats: null, links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [eventsRes, todosRes, subjectsRes, dsaRes, linksRes] = await Promise.all([
          api.get('/calendar/upcoming'),
          api.get('/todos'),
          api.get('/subjects'),
          api.get('/dsa/stats'),
          api.get('/links'),
        ]);
        setData({
          events: eventsRes.data,
          todos: todosRes.data,
          subjects: subjectsRes.data,
          dsaStats: dsaRes.data,
          links: linksRes.data.slice(0, 5),
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getEventLabel = (date) => {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    const diff = differenceInDays(d, new Date());
    if (diff < 7) return `In ${diff} days`;
    return format(d, 'MMM d');
  };

  const eventTypeColors = {
    'Study Session': '#6366f1',
    'Assignment': '#f59e0b',
    'Exam': '#ef4444',
    'Reminder': '#8b5cf6',
    'Other': '#6b7280',
  };

  const pendingTasks = data.todos
    .flatMap((list) => list.tasks.filter((t) => !t.completed).map((t) => ({ ...t, listTitle: list.title })))
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, 5);

  if (loading) return (
    <div className="page-container">
      <div className="stats-grid">
        {[1,2,3,4].map(i => <div key={i} className="skeleton stat-card" style={{ height: 100 }} />)}
      </div>
    </div>
  );

  return (
    <div className="page-container fade-in">
      {/* Greeting */}
      <div className="page-header">
        <div>
          <h1>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!</h1>
          <p>Here's your study overview for {format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/subjects')}>
          <BookOpen size={20} style={{ color: 'var(--color-primary)' }} />
          <div className="stat-value">{data.subjects.length}</div>
          <div className="stat-label">Subjects</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/dsa')}>
          <Code2 size={20} style={{ color: '#10b981' }} />
          <div className="stat-value" style={{ color: '#10b981' }}>{data.dsaStats?.completed || 0}</div>
          <div className="stat-label">DSA Solved</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/todos')}>
          <CheckSquare size={20} style={{ color: '#f59e0b' }} />
          <div className="stat-value" style={{ color: '#f59e0b' }}>{pendingTasks.length}</div>
          <div className="stat-label">Pending Tasks</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/links')}>
          <Link2 size={20} style={{ color: '#8b5cf6' }} />
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{data.links.length}</div>
          <div className="stat-label">Saved Links</div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>

        {/* Upcoming Events */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} style={{ color: 'var(--color-primary)' }} /> Upcoming
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/calendar')}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          {data.events.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <Calendar size={32} style={{ opacity: 0.3 }} />
              <p>No upcoming events. Add some in the Calendar!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {data.events.map((event) => (
                <div key={event._id} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                    background: eventTypeColors[event.type] || '#6b7280'
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{event.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', gap: 8, marginTop: 2 }}>
                      <span>{getEventLabel(event.date)}</span>
                      <span className="badge" style={{ fontSize: '0.65rem', background: eventTypeColors[event.type] + '20', color: eventTypeColors[event.type] }}>{event.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckSquare size={18} style={{ color: '#f59e0b' }} /> Pending Tasks
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/todos')}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <CheckSquare size={32} style={{ opacity: 0.3 }} />
              <p>All caught up! No pending tasks.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {pendingTasks.map((task, i) => (
                <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: task.priority === 'High' ? 'var(--color-danger)' : task.priority === 'Medium' ? 'var(--color-warning)' : 'var(--color-success)'
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{task.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{task.listTitle}</div>
                  </div>
                  {task.dueDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: differenceInDays(new Date(task.dueDate), new Date()) <= 1 ? 'var(--color-danger)' : 'var(--text-tertiary)', flexShrink: 0 }}>
                      <Clock size={12} />
                      {format(new Date(task.dueDate), 'MMM d')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Subjects */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} style={{ color: 'var(--color-primary)' }} /> Subjects
            </h2>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/subjects')}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          {data.subjects.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <BookOpen size={32} style={{ opacity: 0.3 }} />
              <p>No subjects yet. Create your first subject!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {data.subjects.slice(0, 5).map((subject) => (
                <div
                  key={subject._id}
                  onClick={() => navigate(`/subjects/${subject._id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'background var(--transition)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: subject.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '1.1rem' }}>{subject.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{subject.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{subject.notes?.length || 0} notes</div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DSA Progress */}
        {data.dsaStats && data.dsaStats.total > 0 && (
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/dsa')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Code2 size={18} style={{ color: '#10b981' }} /> DSA Progress
              </h2>
              <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-display)' }}>{data.dsaStats.completed}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Completed</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-warning)', fontFamily: 'var(--font-display)' }}>{data.dsaStats.inProgress}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>In Progress</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>{data.dsaStats.notStarted}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Not Started</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', height: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(data.dsaStats.completed / data.dsaStats.total) * 100}%`,
                background: 'linear-gradient(90deg, #10b981, #6366f1)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 1s ease'
              }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
              {Math.round((data.dsaStats.completed / data.dsaStats.total) * 100)}% complete • {data.dsaStats.total} total problems
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
