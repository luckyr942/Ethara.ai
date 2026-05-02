import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [data, setData] = useState({ stats: null, criticalTasks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;

  const { stats, criticalTasks } = data;

  const StatCard = ({ title, value, icon, color, stagger }) => (
    <div className={`card glass animate-slide-up stagger-${stagger}`} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: '200px' }}>
      <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: `${color}15`, color }}>
        {icon}
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{value}</h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{title}</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <StatCard title="Total Tasks" value={stats?.total || 0} icon={<ListTodo size={24} />} color="var(--primary-color)" stagger={1} />
        <StatCard title="To Do" value={stats?.todo || 0} icon={<AlertTriangle size={24} />} color="var(--text-secondary)" stagger={2} />
        <StatCard title="In Progress" value={stats?.inProgress || 0} icon={<Clock size={24} />} color="var(--primary-color)" stagger={3} />
        <StatCard title="Done" value={stats?.done || 0} icon={<CheckCircle size={24} />} color="var(--success-color)" stagger={4} />
        {stats?.overdue > 0 && (
          <StatCard title="Overdue" value={stats.overdue} icon={<AlertTriangle size={24} />} color="var(--danger-color)" stagger={5} />
        )}
      </div>

      <div className="card glass">
        <h2 style={{ marginBottom: '1.5rem' }}>Critical & Upcoming Tasks</h2>
        {criticalTasks?.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No upcoming tasks.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {criticalTasks.map(task => (
              <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0' }}>{task.title}</h4>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <Link to={`/projects/${task.project_id}`} className="btn-secondary" style={{ fontSize: '0.875rem' }}>View Project</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
