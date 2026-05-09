import { useState, useEffect } from 'react';
import { X, UserPlus, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

function getInitials(name = '') {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function MembersPanel({ projectId, onClose }) {
  const { user } = useAuthStore();
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [email, setEmail]       = useState('');
  const [role, setRole]         = useState('Member');
  const [inviteErr, setInviteErr] = useState('');
  const [isAdmin, setIsAdmin]   = useState(false);

  useEffect(() => {
    loadMembers();
  }, [projectId]);

  async function loadMembers() {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setMembers(res.data);
      const me = res.data.find((m) => m.id === user.id);
      setIsAdmin(me?.role === 'Admin');
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e) {
    e.preventDefault();
    setInviteErr('');
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email, role });
      setMembers((prev) => [...prev, res.data]);
      setEmail('');
    } catch (err) {
      setInviteErr(err.response?.data?.error || 'Failed to add member');
    }
  }

  async function handleRemove(uid) {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${projectId}/members/${uid}`);
      setMembers((prev) => prev.filter((m) => m.id !== uid));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member');
    }
  }

  async function handleRoleChange(uid, newRole) {
    try {
      await api.put(`/projects/${projectId}/members/${uid}`, { role: newRole });
      setMembers((prev) => prev.map((m) => m.id === uid ? { ...m, role: newRole } : m));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    }
  }

  return (
    <div className="members-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Team Members</h3>
        <button className="btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      {isAdmin && (
        <form onSubmit={handleInvite} style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              id="invite-email"
              className="form-input"
              type="email"
              placeholder="Invite by email…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select id="invite-role" className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Member</option>
                <option>Admin</option>
              </select>
              <button type="submit" className="btn btn-primary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                <UserPlus size={14} /> Invite
              </button>
            </div>
            {inviteErr && <div className="form-error">{inviteErr}</div>}
          </div>
        </form>
      )}

      <div className="divider" />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading…</div>
      ) : (
        members.map((m) => (
          <div className="member-row" key={m.id}>
            <div className="avatar">{getInitials(m.name)}</div>
            <div className="member-info">
              <div className="member-name">{m.name} {m.id === user.id && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>(you)</span>}</div>
              <div className="member-email">{m.email}</div>
            </div>
            {isAdmin && m.id !== user.id ? (
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <select
                  className="form-select"
                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', width: 'auto' }}
                  value={m.role}
                  onChange={(e) => handleRoleChange(m.id, e.target.value)}
                >
                  <option>Member</option>
                  <option>Admin</option>
                </select>
                <button className="btn-icon" onClick={() => handleRemove(m.id)}>
                  <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                </button>
              </div>
            ) : (
              <span className={`badge badge-${m.role === 'Admin' ? 'admin' : 'member'}`}>{m.role}</span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
