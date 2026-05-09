import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

export default function TaskModal({ onClose, onSaved, projectId, members = [], existing }) {
  const [form, setForm] = useState({
    title:       existing?.title       || '',
    description: existing?.description || '',
    priority:    existing?.priority    || 'Medium',
    status:      existing?.status      || 'Todo',
    assigned_to: existing?.assigned_to || '',
    due_date:    existing?.due_date    || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError('Task title is required');
    setLoading(true); setError('');
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
        due_date:    form.due_date    || null,
      };
      let res;
      if (existing) {
        res = await api.put(`/tasks/${existing.id}`, payload);
      } else {
        res = await api.post(`/projects/${projectId}/tasks`, payload);
      }
      onSaved(res.data, !!existing);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          <span>{existing ? 'Edit Task' : 'New Task'}</span>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Title *</label>
            <input id="task-title" className="form-input" placeholder="Task title"
              value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea id="task-description" className="form-textarea" placeholder="Optional details…"
              value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select id="task-priority" className="form-select"
                value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select id="task-status" className="form-select"
                value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option>Todo</option>
                <option value="In Progress">In Progress</option>
                <option>Done</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Assign to</label>
              <select id="task-assignee" className="form-select"
                value={form.assigned_to} onChange={(e) => set('assigned_to', e.target.value)}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input id="task-due-date" type="date" className="form-input"
                value={form.due_date}
                onChange={(e) => set('due_date', e.target.value)}
                style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : existing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
