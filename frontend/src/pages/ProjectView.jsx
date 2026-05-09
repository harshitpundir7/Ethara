import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Pencil, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import MembersPanel from '../components/MembersPanel';
import ProjectModal from '../components/ProjectModal';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [project, setProject]         = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [members, setMembers]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask]       = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [userRole, setUserRole]       = useState('Member');

  useEffect(() => { loadAll(); }, [id]);

  async function loadAll() {
    try {
      const [projRes, tasksRes, membersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
        api.get(`/projects/${id}/members`),
      ]);
      setProject(projRes.data);
      setUserRole(projRes.data.user_role);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = userRole === 'Admin';

  function handleTaskSaved(task, isEdit) {
    if (isEdit) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    } else {
      setTasks((prev) => [task, ...prev]);
    }
  }

  function handleTaskClick(task) {
    setEditTask(task);
    setShowTaskModal(true);
  }

  async function handleDeleteTask(taskId) {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setShowTaskModal(false);
      setEditTask(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  }

  async function handleDeleteProject() {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-loader"><div className="spinner" /></div>
      </>
    );
  }

  const todo     = tasks.filter((t) => t.status === 'Todo').length;
  const inProg   = tasks.filter((t) => t.status === 'In Progress').length;
  const done     = tasks.filter((t) => t.status === 'Done').length;
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <>
      <Navbar />

      <div className="project-layout" style={{ paddingRight: showMembers ? '340px' : '1.5rem', transition: 'padding 0.2s ease' }}>
        {/* Header */}
        <div className="project-header">
          <button className="btn-icon" onClick={() => navigate('/')} title="Back">
            <ArrowLeft size={20} />
          </button>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1>{project?.name}</h1>
              <span className={`badge badge-${isAdmin ? 'admin' : 'member'}`}>{userRole}</span>
            </div>
            {project?.description && (
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{project.description}</p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Progress summary */}
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--status-todo)' }}>{todo} todo</span>
              <span>·</span>
              <span style={{ color: 'var(--status-inprog)' }}>{inProg} in progress</span>
              <span>·</span>
              <span style={{ color: 'var(--status-done)' }}>{done} done</span>
            </div>

            {isAdmin && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowTaskModal(true); }}>
                  <Plus size={14} /> Task
                </button>
                <button className="btn-icon" title="Edit project" onClick={() => setShowEditProject(true)}>
                  <Pencil size={15} />
                </button>
                <button className="btn-icon" title="Delete project" onClick={handleDeleteProject}>
                  <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                </button>
              </>
            )}

            <button
              className={`btn ${showMembers ? 'btn-outline' : 'btn-outline'} btn-sm`}
              onClick={() => setShowMembers((v) => !v)}
              style={{ borderColor: showMembers ? 'var(--accent)' : undefined }}
            >
              <Users size={14} /> Team
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Kanban */}
        <KanbanBoard
          tasks={tasks}
          isAdmin={isAdmin}
          onTaskClick={handleTaskClick}
          onAddTask={() => { setEditTask(null); setShowTaskModal(true); }}
        />
      </div>

      {/* Members Side Panel */}
      {showMembers && (
        <MembersPanel projectId={id} onClose={() => setShowMembers(false)} />
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          projectId={id}
          existing={editTask}
          members={members}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSaved={handleTaskSaved}
          isAdmin={isAdmin}
          onDelete={isAdmin && editTask ? handleDeleteTask : undefined}
        />
      )}

      {/* Edit Project Modal */}
      {showEditProject && (
        <ProjectModal
          existing={project}
          onClose={() => setShowEditProject(false)}
          onCreated={(updated) => setProject(updated)}
        />
      )}
    </>
  );
}
