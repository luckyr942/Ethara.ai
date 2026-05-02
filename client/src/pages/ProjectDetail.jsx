import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, UserPlus } from 'lucide-react';
import api from '../api';

function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', assigneeId: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.role === 'ADMIN';

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/tasks/project/${id}`, newTask);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', dueDate: '', assigneeId: '' });
      fetchProject();
    } catch (err) {
      console.error(err);
      alert('Error creating task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchProject();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
      fetchProject();
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const tasksTodo = project.tasks.filter(t => t.status === 'TODO');
  const tasksInProgress = project.tasks.filter(t => t.status === 'IN_PROGRESS');
  const tasksDone = project.tasks.filter(t => t.status === 'DONE');

  const TaskCard = ({ task }) => (
    <div className="card glass" style={{ marginBottom: '1rem', padding: '1rem', transition: 'transform 0.2s', cursor: 'grab' }}>
      <h4 style={{ margin: '0 0 0.5rem 0' }}>{task.title}</h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{task.description}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        <span style={{ backgroundColor: 'var(--surface-hover)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
          {task.assignee_name || 'Unassigned'}
        </span>
        {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {task.status !== 'TODO' && <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => updateTaskStatus(task.id, 'TODO')}>To Do</button>}
        {task.status !== 'IN_PROGRESS' && <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}>In Progress</button>}
        {task.status !== 'DONE' && <button className="btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => updateTaskStatus(task.id, 'DONE')}>Done</button>}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{project.name}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setShowMemberModal(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} /> Add Member
            </button>
            <button onClick={() => setShowTaskModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> New Task
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Kanban Board */}
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><span className="badge badge-TODO">TODO</span></h3>
          {tasksTodo.map(t => <TaskCard key={t.id} task={t} />)}
        </div>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><span className="badge badge-IN_PROGRESS">IN PROGRESS</span></h3>
          {tasksInProgress.map(t => <TaskCard key={t.id} task={t} />)}
        </div>
        <div>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><span className="badge badge-DONE">DONE</span></h3>
          {tasksDone.map(t => <TaskCard key={t.id} task={t} />)}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Create Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input required type="text" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Assignee</label>
                <select value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>User Email</label>
                <input required type="email" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} placeholder="user@example.com" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;
