import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, ListTodo, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

function isOverdue(t) {
  return t.status !== 'Done' && t.due_date && new Date(t.due_date) < new Date(new Date().toDateString());
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchDashboard(); }, []);

  async function fetchDashboard() {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } finally {
      setLoading(false);
    }
  }

  function handleProjectCreated(project) {
    setData((d) => ({
      ...d,
      totalProjects: (d?.totalProjects || 0) + 1,
      recentProjects: [project, ...(d?.recentProjects || [])].slice(0, 6),
    }));
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-loader"><div className="spinner" /></div>
      </>
    );
  }

  const stats = data?.taskStats || {};

  return (
    <>
      <Navbar />

      <div className="dashboard-layout">
        {/* Welcome */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>
              Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p style={{ marginTop: '0.25rem' }}>Here's what's happening across your projects.</p>
          </div>
          <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard icon={<FolderOpen size={20} />} label="Total Projects" value={data?.totalProjects} color="var(--accent-light)" />
          <StatCard icon={<ListTodo size={20} />}   label="Total Tasks"   value={stats.total}          color="var(--cyan)" />
          <StatCard icon={<CheckCircle2 size={20}/>} label="Completed"    value={stats.done}           color="var(--success)" />
          <StatCard icon={<Clock size={20} />}       label="In Progress"  value={stats.in_progress}    color="var(--warning)" />
          <StatCard icon={<AlertTriangle size={20}/>} label="Overdue"     value={stats.overdue}        color="var(--danger)" />
        </div>

        {/* My Tasks */}
        {data?.myTasks?.length > 0 && (
          <div>
            <div className="section-header">
              <h2>Assigned to Me</h2>
            </div>
            <div className="my-tasks-list">
              {data.myTasks.map((t) => (
                <div key={t.id} className="task-row" onClick={() => navigate(`/project/${t.project_id}`)}>
                  <span className={`badge badge-${t.priority === 'High' ? 'high' : t.priority === 'Medium' ? 'medium' : 'low'}`}>
                    {t.priority}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="task-row-title">{t.title}</div>
                    <div className="task-row-project">{t.project_name}</div>
                  </div>
                  <span className={`badge badge-${t.status === 'Done' ? 'done' : t.status === 'In Progress' ? 'inprog' : 'todo'}`}>
                    {t.status}
                  </span>
                  {t.due_date && (
                    <div className={`task-row-due ${isOverdue(t) ? 'overdue' : ''}`}>
                      {new Date(t.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {isOverdue(t) && ' ⚠'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        <div>
          <div className="section-header">
            <h2>Projects</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setShowModal(true)}>
              <Plus size={14} /> New
            </button>
          </div>

          {data?.recentProjects?.length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={48} />
              <p>No projects yet. Create your first one!</p>
            </div>
          ) : (
            <div className="projects-grid">
              {data?.recentProjects?.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </>
  );
}
