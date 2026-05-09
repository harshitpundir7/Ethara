import { Calendar } from 'lucide-react';

const PRIORITY_CLASS = { High: 'high', Medium: 'medium', Low: 'low' };
const STATUS_CLASS   = { 'Todo': 'todo', 'In Progress': 'inprog', 'Done': 'done' };

function isOverdue(dueDate, status) {
  if (!dueDate || status === 'Done') return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function TaskCard({ task, onClick }) {
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div className="task-card" onClick={() => onClick(task)}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
        <span className={`badge badge-${PRIORITY_CLASS[task.priority]}`}>{task.priority}</span>
        <span className={`badge badge-${STATUS_CLASS[task.status]}`}>{task.status}</span>
      </div>

      <div className="task-card-title">{task.title}</div>
      {task.description && <div className="task-card-desc">{task.description}</div>}

      <div className="task-card-footer">
        <div className="task-card-assignee">
          {task.assignee_name ? (
            <>
              <div className="avatar avatar-sm">{getInitials(task.assignee_name)}</div>
              <span>{task.assignee_name}</span>
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
          )}
        </div>

        {task.due_date && (
          <div className={`task-due ${overdue ? 'overdue' : ''}`}>
            <Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />
            {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {overdue && ' ⚠'}
          </div>
        )}
      </div>
    </div>
  );
}
