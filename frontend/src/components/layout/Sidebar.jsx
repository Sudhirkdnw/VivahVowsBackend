import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { logout, selectCurrentUser } from '../../redux/authSlice.js';
import { selectUnreadCount } from '../../redux/notificationSlice.js';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/profile', label: 'Profile', icon: '🧬' },
  { path: '/matches', label: 'Matches', icon: '💞' },
  { path: '/messages', label: 'Messages', icon: '💬' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
];

const Sidebar = ({ pinned, onToggle, onClose, onMobileToggle }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const unreadCount = useSelector(selectUnreadCount);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 960;

  const classes = useMemo(() => {
    return ['sidebar', pinned ? '' : 'sidebar--collapsed'].filter(Boolean).join(' ');
  }, [pinned]);

  return (
    <aside className={classes}>
      <div className="sidebar__brand">
        <button
          type="button"
          aria-label={pinned ? 'Collapse sidebar' : 'Expand sidebar'}
          className="button button--ghost"
          style={{ padding: '10px 12px' }}
          onClick={onToggle}
        >
          {pinned ? '⟨' : '⟩'}
        </button>
        <span className="sidebar__brand-text">VivahVows OS</span>
      </div>
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              ['sidebar__link', isActive ? 'active' : ''].filter(Boolean).join(' ')
            }
            onClick={() => onClose?.()}
          >
            <span aria-hidden className="sidebar__icon">
              {item.icon}
            </span>
            <span className="sidebar__label">{item.label}</span>
            {item.path === '/notifications' && unreadCount > 0 && (
              <span className="badge" style={{ marginLeft: 'auto' }}>
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer">
        <div className="sidebar__cta">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.7 }}>
            Logged in as
          </div>
          <div style={{ fontWeight: 600 }}>{user?.email ?? 'Guest'}</div>
        </div>
        <button
          type="button"
          className="button button--ghost"
          onClick={() => {
            dispatch(logout());
            onClose?.();
          }}
        >
          Sign out
        </button>
        {!pinned && isMobile && (
          <button type="button" className="button" onClick={onMobileToggle}>
            Close menu
          </button>
        )}
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  pinned: PropTypes.bool,
  onToggle: PropTypes.func,
  onClose: PropTypes.func,
  onMobileToggle: PropTypes.func
};

export default Sidebar;
