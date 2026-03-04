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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchAPI.dashboard()
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Disable main page scroll when dashboard is active
    const parent = document.querySelector('.page-content');
    if (parent) parent.style.overflowY = 'hidden';
    return () => {
      if (parent) parent.style.overflowY = 'auto';
    };
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Spinner size={32} />
    </div>
  );

  const dsaTotal = stats?.dsa?.total || 0;
  const dsaDone = stats?.dsa?.completed || 0;
  const pct = dsaTotal ? Math.round((dsaDone / dsaTotal) * 100) : 0;

  const statCards = [
    { label: 'Subjects', num: stats?.subjects || 0, icon: 'book', color: 'var(--blue)', bg: 'var(--blue-bg)', path: '/subjects' },
    { label: 'DSA Problems', num: dsaTotal, icon: 'code', color: 'var(--purple)', bg: 'var(--purple-bg)', path: '/dsa' },
    { label: 'Saved Links', num: stats?.links || 0, icon: 'link', color: 'var(--green)', bg: 'var(--green-bg)', path: '/links' },
    { label: 'Tasks', num: stats?.pendingTasks || 0, icon: 'checklist', color: 'var(--yellow)', bg: 'var(--yellow-bg)', path: '/todos' },
  ];

  return (
    <div className="dashboard-root" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 12, // Reduced gap
      padding: '4px 0' // Slight padding
    }}>
      <div className="page-header" style={{ marginBottom: 4 }}>
        <div>
          <div className="page-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Good {greet()}, {user?.name?.split(' ')[0]} 👋</div>
          <div className="page-subtitle" style={{ fontSize: '0.8rem', marginTop: 1 }}>Study overview for today</div>
        </div>
      </div>

      {/* Stat cards - more compact */}
      <div className="grid-4" style={{ gap: 10 }}>
        {statCards.map((s) => (
          <div key={s.label} className="stat-card card-hover" style={{ padding: '8px 12px', flexDirection: 'row', alignItems: 'center', gap: 10 }} onClick={() => navigate(s.path)}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color, width: 32, height: 32, marginBottom: 0, flexShrink: 0 }}><Icon name={s.icon} size={16} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div className="stat-num" style={{ fontSize: 18, lineHeight: 1 }}>{s.num}</div>
              <div className="stat-label" style={{ fontSize: 9 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 12,
        flex: 1,
        minHeight: 0
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          {/* DSA progress */}
          {dsaTotal > 0 && (
            <div className="card" style={{ padding: 12, flexShrink: 0 }}>
              <div className="flex items-center justify-between mb-2">
                <div style={{ fontWeight: 700, fontSize: 13 }}>DSA Progress</div>
                <span className="badge badge-purple" style={{ fontSize: 9 }}>{dsaDone}/{dsaTotal} solved</span>
              </div>
              <div className="progress-bar" style={{ height: 5 }}>
                <div className="progress-fill" style={{ width: pct + '%', background: 'var(--purple)' }} />
              </div>
              <div className="flex gap-4 mt-1.5 text-[10px] text-muted">
                <span>{stats?.dsa?.['not-started'] || 0} todo</span>
                <span>{stats?.dsa?.['in-progress'] || 0} doing</span>
                <span>{dsaDone} done</span>
              </div>
            </div>
          )}

          {/* Upcoming events - scrollable but contained */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 12, minHeight: 0 }}>
            <div className="flex items-center justify-between mb-2">
              <div style={{ fontWeight: 700, fontSize: 13 }}>Upcoming Events</div>
              <button className="btn btn-ghost btn-sm" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => navigate('/calendar')}>View all</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
              {(stats?.upcomingEvents || []).length === 0
                ? <div className="text-xs text-muted">No upcoming events.</div>
                : (stats.upcomingEvents || []).map((ev) => (
                  <div key={ev._id} className="flex items-center gap-3 mb-1.5 p-1.5" style={{ background: 'var(--bg2)', borderRadius: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: typeColor[ev.type] + '22', color: typeColor[ev.type], display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name="calendar" size={12} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="truncate" style={{ fontWeight: 600, fontSize: 12 }}>{ev.title}</div>
                      <div className="text-[10px] text-muted">{fmtDate(ev.date)} · {ev.type}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Right Column - Side by side parts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 12, overflowY: 'auto' }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Add note', icon: 'book', path: '/subjects' },
                { label: 'Save link', icon: 'link', path: '/links' },
                { label: 'DSA Track', icon: 'code', path: '/dsa' },
                { label: 'Schedule', icon: 'calendar', path: '/calendar' },
                { label: 'Daily Tasks', icon: 'fire', path: '/habits' },
              ].map((q) => (
                <div key={q.path} className="flex items-center gap-3 card-hover" style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)' }} onClick={() => navigate(q.path)}>
                  <div style={{ color: 'var(--accent)', background: 'var(--accent-bg)', width: 28, height: 28, borderRadius: 6, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon name={q.icon} size={14} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{q.label}</div>
                  </div>
                  <Icon name="chevronRight" size={12} style={{ color: 'var(--text3)' }} />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 12 }}>
              <div style={{ background: 'var(--accent-bg)', padding: 10, borderRadius: 10, border: '1px dashed var(--accent)' }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 2 }}>Daily Focus</div>
                <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3, fontStyle: 'italic' }}>"Success is the sum of small efforts, repeated daily."</div>
              </div>
            </div>
          </div>
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
