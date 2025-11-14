import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { selectCurrentUser } from '../../redux/authSlice.js';
import { selectUnreadCount } from '../../redux/notificationSlice.js';

const Topbar = ({ sidebarPinned, onToggleSidebar, onMobileToggle }) => {
  const user = useSelector(selectCurrentUser);
  const unread = useSelector(selectUnreadCount) ?? 0;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 960;

  return (
    <header className="topbar">
      <div className="topbar__search">
        <button
          type="button"
          className="button button--ghost"
          style={{ padding: '8px 12px' }}
          onClick={isMobile ? onMobileToggle : onToggleSidebar}
        >
          {isMobile ? '☰' : sidebarPinned ? '⟨' : '⟩'}
        </button>
        <input
          type="search"
          placeholder="Search profiles, matches, conversations..."
          style={{ flex: 1, border: 'none' }}
        />
      </div>
      <div className="topbar__actions">
        <div className="badge">{unread} alerts</div>
        <div className="surface-card" style={{ padding: '10px 16px', borderRadius: '999px' }}>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Welcome back</div>
          <div style={{ fontWeight: 600 }}>{user?.name ?? user?.email ?? 'Member'}</div>
        </div>
      </div>
    </header>
  );
};

Topbar.propTypes = {
  sidebarPinned: PropTypes.bool,
  onToggleSidebar: PropTypes.func,
  onMobileToggle: PropTypes.func
};

export default Topbar;
