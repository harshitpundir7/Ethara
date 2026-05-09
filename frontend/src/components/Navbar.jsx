import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function getInitials(name = '') {
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" style={{ textDecoration: 'none' }}>
        ⬡ Etharia
      </Link>

      <div className="navbar-right">
        <Link to="/">
          <button className="btn-icon" title="Dashboard">
            <LayoutDashboard size={18} />
          </button>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="avatar avatar-sm">{getInitials(user.name)}</div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {user.name}
            </span>
          </div>
        )}

        <button className="btn-icon" title="Logout" onClick={handleLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
