import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../shared/Icon';
import Spinner from '../shared/Spinner';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
const typeColor = { study: 'var(--blue)', exam: 'var(--red)', assignment: 'var(--yellow)', reminder: 'var(--green)' };

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchAPI.dashboard()
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-between" style={{ padding: 60, justifyContent: 'center' }}><Spinner size={32} /></div>;

  const dsaTotal = stats?.dsa?.total || 0;
  const dsaDone  = stats?.dsa?.completed || 0;
  const pct = dsaTotal ? Math.round((dsaDone / dsaTotal) * 100) : 0;

  const statCards = [
    { label: 'Subjects',      num: stats?.subjects || 0,      icon: 'book',      color: 'var(--blue)',   bg: 'var(--blue-bg)',   path: '/subjects' },
    { label: 'DSA Problems',  num: dsaTotal,                  icon: 'code',      color: 'var(--purple)', bg: 'var(--purple-bg)', path: '/dsa' },
    { label: 'Saved Links',   num: stats?.links || 0,         icon: 'link',      color: 'var(--green)',  bg: 'var(--green-bg)',  path: '/links' },
    { label: 'Pending Tasks', num: stats?.pendingTasks || 0,  icon: 'checklist', color: 'var(--yellow)', bg: 'var(--yellow-bg)', path: '/todos' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Good {greet()}, {user?.name?.split(' ')[0]} 👋</div>
          <div className="page-subtitle">Here's your study overview for today</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} className="stat-card card-hover" onClick={() => navigate(s.path)}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><Icon name={s.icon} size={20} /></div>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* DSA progress */}
      {dsaTotal > 0 && (
        <div className="card mb-4" style={{ marginBottom: 20 }}>
          <div className="flex items-center justify-between mb-3">
            <div style={{ fontWeight: 700 }}>DSA Progress</div>
            <span className="badge badge-purple">{dsaDone}/{dsaTotal} solved</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: pct + '%', background: 'var(--purple)' }} />
          </div>
          <div className="flex gap-4 mt-3 text-sm text-muted">
            <span>{stats?.dsa?.['not-started'] || 0} not started</span>
            <span>{stats?.dsa?.['in-progress'] || 0} in progress</span>
            <span>{dsaDone} completed</span>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Upcoming events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div style={{ fontWeight: 700 }}>Upcoming Events</div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/calendar')}>View all</button>
          </div>
          {(stats?.upcomingEvents || []).length === 0
            ? <div className="text-sm text-muted">No upcoming events — add some in the calendar!</div>
            : (stats.upcomingEvents || []).map((ev) => (
              <div key={ev._id} className="flex items-center gap-3 mb-3">
                <div style={{ width: 38, height: 38, borderRadius: 8, background: typeColor[ev.type] + '22', color: typeColor[ev.type], display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="calendar" size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ev.title}</div>
                  <div className="text-xs text-muted">{fmtDate(ev.date)} · {ev.type}</div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Quick tips */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Quick Actions</div>
          {[
            { label: 'Add a new note', icon: 'book',      path: '/subjects', hint: 'Organize by subject' },
            { label: 'Save a link',    icon: 'link',      path: '/links',    hint: 'Bookmark resources' },
            { label: 'Track a problem',icon: 'code',      path: '/dsa',      hint: 'DSA problem tracker' },
            { label: 'Schedule event', icon: 'calendar',  path: '/calendar', hint: 'Deadlines & exams' },
          ].map((q) => (
            <div key={q.path} className="flex items-center gap-3 mb-3 card-hover" style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg2)' }} onClick={() => navigate(q.path)}>
              <div style={{ color: 'var(--accent)' }}><Icon name={q.icon} size={16} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{q.label}</div>
                <div className="text-xs text-muted">{q.hint}</div>
              </div>
              <Icon name="chevronRight" size={14} style={{ color: 'var(--text3)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
};

export default Dashboard;
