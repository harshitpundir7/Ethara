import { useNavigate } from 'react-router-dom';
import { Users, CheckSquare } from 'lucide-react';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const progress = project.task_count > 0
    ? Math.round((project.done_count / project.task_count) * 100)
    : 0;

  return (
    <div
      className="card project-card card-hover-lift"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      <div className="project-card-header">
        <h3>{project.name}</h3>
        <span className={`badge badge-${project.user_role === 'Admin' ? 'admin' : 'member'}`}>
          {project.user_role}
        </span>
      </div>

      {project.description && (
        <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-secondary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {project.description}
        </p>
      )}

      <div className="project-card-meta">
        <span><Users size={13} /> {project.member_count} member{project.member_count !== 1 ? 's' : ''}</span>
        <span><CheckSquare size={13} /> {project.done_count}/{project.task_count} tasks</span>
      </div>

      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.375rem', textAlign: 'right' }}>
        {progress}% complete
      </p>
    </div>
  );
}
