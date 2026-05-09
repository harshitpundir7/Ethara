import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../api/axios';
import { getErrMsg } from '../api/errors';
import { useAuthStore } from '../store/authStore';

export default function Signup() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  function set(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(getErrMsg(err, 'Signup failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">⬡ Etharia</div>
          <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Start collaborating today</h2>
          <p className="auth-tagline">
            Create your free account and invite your team to start managing projects in minutes.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div>
            <h2>Create account</h2>
            <p>Join Etharia and get things done</p>
          </div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full Name</label>
              <input id="signup-name" className="form-input" placeholder="John Doe"
                value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email</label>
              <input id="signup-email" type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-password">Password</label>
              <input id="signup-password" type="password" className="form-input" placeholder="Min. 6 characters"
                value={form.password} onChange={(e) => set('password', e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
              <input id="signup-confirm" type="password" className="form-input" placeholder="Repeat password"
                value={form.confirm} onChange={(e) => set('confirm', e.target.value)} required />
            </div>

            <button id="signup-submit" type="submit" className="btn btn-primary w-full"
              style={{ justifyContent: 'center' }} disabled={loading}>
              <UserPlus size={16} />
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
