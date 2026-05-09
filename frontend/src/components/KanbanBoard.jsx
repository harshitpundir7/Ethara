import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const COLUMNS = [
  { key: 'Todo',        label: 'Todo',        color: 'var(--status-todo)',   dot: '#64748b' },
  { key: 'In Progress', label: 'In Progress',  color: 'var(--status-inprog)', dot: '#f59e0b' },
  { key: 'Done',        label: 'Done',         color: 'var(--status-done)',   dot: '#10b981' },
];

export default function KanbanBoard({ tasks, isAdmin, onTaskClick, onAddTask }) {
  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.key);
        return (
          <div className="kanban-col" key={col.key}>
            <div className="kanban-col-header">
              <div className="kanban-col-title" style={{ color: col.color }}>
                <div className="col-dot" style={{ background: col.dot }} />
                {col.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="col-count">{colTasks.length}</span>
                {isAdmin && col.key === 'Todo' && (
                  <button className="btn-icon" title="Add task" onClick={onAddTask}>
                    <Plus size={15} />
                  </button>
                )}
              </div>
            </div>
            <div className="kanban-tasks">
              {colTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No tasks
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
