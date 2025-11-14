import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AppShell() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">VivahVows</div>
        <div className="user-card">
          <div className="avatar" aria-hidden>
            {profile?.name?.[0]?.toUpperCase() || user?.first_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="user-name">{profile?.name || `${user?.first_name} ${user?.last_name}`}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <nav className="nav-links">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/suggestions">Suggestions</NavLink>
          <NavLink to="/matches">Mutual Matches</NavLink>
          <NavLink to="/chat">Chat</NavLink>
          <NavLink to="/notifications">Notifications</NavLink>
        </nav>
        <button type="button" className="btn secondary" onClick={handleLogout}>
          Log out
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
