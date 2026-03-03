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
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton stat-card" style={{ height: 100 }} />)}
      </div>
    </div>
  );

  useEffect(() => {
    // Disable main page scroll when dashboard is active
    const parent = document.querySelector('.page-content');
    if (parent) parent.style.overflowY = 'hidden';
    return () => {
      if (parent) parent.style.overflowY = 'auto';
    };
  }, []);

  return (
    <div className="page-container fade-in" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)', // Smaller gap
      padding: 'var(--space-4)',
      overflow: 'hidden',
      maxWidth: '100%' // Use full width
    }}>
      {/* Greeting */}
      <div className="page-header" style={{ marginBottom: 0, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}!
          </h1>
          <p style={{ fontSize: '0.75rem' }}>Overview for {format(new Date(), 'EEEE, MMMM do')}</p>
        </div>
      </div>

      {/* Stats Row - Extra compact */}
      <div className="stats-grid" style={{ marginBottom: 0, flexShrink: 0, gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)' }}>
        <div className="stat-card" style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/subjects')}>
          <BookOpen size={16} style={{ color: 'var(--color-primary)' }} />
          <div style={{ marginLeft: 'var(--space-2)' }}>
            <div className="stat-value" style={{ fontSize: '1.1rem', lineHeight: 1 }}>{data.subjects.length}</div>
            <div className="stat-label" style={{ fontSize: '0.65rem' }}>Subjects</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/dsa')}>
          <Code2 size={16} style={{ color: '#10b981' }} />
          <div style={{ marginLeft: 'var(--space-2)' }}>
            <div className="stat-value" style={{ fontSize: '1.1rem', lineHeight: 1, color: '#10b981' }}>{data.dsaStats?.completed || 0}</div>
            <div className="stat-label" style={{ fontSize: '0.65rem' }}>DSA Solved</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/todos')}>
          <CheckSquare size={16} style={{ color: '#f59e0b' }} />
          <div style={{ marginLeft: 'var(--space-2)' }}>
            <div className="stat-value" style={{ fontSize: '1.1rem', lineHeight: 1, color: '#f59e0b' }}>{pendingTasks.length}</div>
            <div className="stat-label" style={{ fontSize: '0.65rem' }}>Tasks</div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/links')}>
          <Link2 size={16} style={{ color: '#8b5cf6' }} />
          <div style={{ marginLeft: 'var(--space-2)' }}>
            <div className="stat-value" style={{ fontSize: '1.1rem', lineHeight: 1, color: '#8b5cf6' }}>{data.links.length}</div>
            <div className="stat-label" style={{ fontSize: '0.65rem' }}>Links</div>
          </div>
        </div>
      </div>

      {/* Main Grid - Flexible height */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: 'var(--space-3)',
        flex: 1,
        minHeight: 0
      }}>

        {/* Upcoming Events */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, padding: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexShrink: 0 }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} style={{ color: 'var(--color-primary)' }} /> Upcoming
            </h2>
            <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => navigate('/calendar')}>
              View
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {data.events.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-2)' }}>
                <p style={{ fontSize: '0.75rem' }}>No events.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1.5)' }}>
                {data.events.map((event) => (
                  <div key={event._id} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', padding: '6px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                      background: eventTypeColors[event.type] || '#6b7280'
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="truncate" style={{ fontSize: '0.75rem', fontWeight: 500 }}>{event.title}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{getEventLabel(event.date)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, padding: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexShrink: 0 }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckSquare size={14} style={{ color: '#f59e0b' }} /> Tasks
            </h2>
            <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => navigate('/todos')}>
              View
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {pendingTasks.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-2)' }}>
                <p style={{ fontSize: '0.75rem' }}>All clear!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1.5)' }}>
                {pendingTasks.map((task, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', padding: '6px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                      background: task.priority === 'High' ? 'var(--color-danger)' : task.priority === 'Medium' ? 'var(--color-warning)' : 'var(--color-success)'
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="truncate" style={{ fontSize: '0.75rem', fontWeight: 500 }}>{task.title}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{task.listTitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Subjects */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, padding: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexShrink: 0 }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={14} style={{ color: 'var(--color-primary)' }} /> Subjects
            </h2>
            <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: '0.7rem' }} onClick={() => navigate('/subjects')}>
              View
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
            {data.subjects.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-2)' }}>
                <p style={{ fontSize: '0.75rem' }}>No subjects.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {data.subjects.slice(0, 10).map((subject) => (
                  <div
                    key={subject._id}
                    onClick={() => navigate(`/subjects/${subject._id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'background var(--transition)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: subject.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem' }}>{subject.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="truncate" style={{ fontSize: '0.75rem', fontWeight: 500 }}>{subject.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DSA Progress */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, justifyContent: 'center', padding: 'var(--space-3)' }} onClick={() => navigate('/dsa')}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-3)' }}>
            <Code2 size={14} style={{ color: '#10b981' }} /> DSA Goal
          </h2>

          {data.dsaStats && data.dsaStats.total > 0 ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>{data.dsaStats.completed}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: 2 }}>Solved</div>
                </div>
                <div style={{ width: 1, backgroundColor: 'var(--border-color)' }} />
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)', lineHeight: 1 }}>{data.dsaStats.total}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: 2 }}>Total</div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', height: 8, overflow: 'hidden', marginBottom: 'var(--space-2)' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (data.dsaStats.completed / data.dsaStats.total) * 100)}%`,
                  background: 'linear-gradient(90deg, #10b981, #6366f1)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 1s ease'
                }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {Math.round((data.dsaStats.completed / data.dsaStats.total) * 100)}% Complete
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-2)' }}>
              <p style={{ fontSize: '0.75rem' }}>No DSA stats.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
