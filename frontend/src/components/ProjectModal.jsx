import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';

export default function ProjectModal({ onClose, onCreated, existing }) {
  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Project name is required');
    setLoading(true);
    setError('');
    try {
      if (existing) {
        const res = await api.put(`/projects/${existing.id}`, { name, description });
        onCreated(res.data);
      } else {
        const res = await api.post('/projects', { name, description });
        onCreated(res.data);
      }
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
          <span>{existing ? 'Edit Project' : 'New Project'}</span>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              id="project-name"
              className="form-input"
              placeholder="e.g. Marketing Website Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              id="project-description"
              className="form-textarea"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : existing ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
