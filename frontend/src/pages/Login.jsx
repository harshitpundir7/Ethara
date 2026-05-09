import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Zap, CheckCircle, Users } from 'lucide-react';
import api from '../api/axios';
import { getErrMsg } from '../api/errors';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(getErrMsg(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">⬡ Etharia</div>
          <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Collaborate. Ship. Win.</h2>
          <p className="auth-tagline">
            Manage projects, assign tasks, and track progress — with role-based access control built-in.
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            {[
              { icon: <Zap size={16} />, text: 'Real-time task assignment & status tracking' },
              { icon: <Users size={16} />, text: 'Admin / Member role-based permissions' },
              { icon: <CheckCircle size={16} />, text: 'Visual Kanban boards per project' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--accent-light)' }}>{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div>
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }} disabled={loading}>
              <LogIn size={16} />
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
