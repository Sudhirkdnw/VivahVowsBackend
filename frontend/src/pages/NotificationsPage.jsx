import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadNotifications, markRead, selectNotifications } from '../redux/notificationSlice.js';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const items = Array.isArray(notifications?.results) ? notifications.results : notifications ?? [];

  useEffect(() => {
    dispatch(loadNotifications());
  }, [dispatch]);

  return (
    <div className="surface-grid" style={{ gap: '24px' }}>
      <header className="section-header">
        <div>
          <div className="badge">Activity</div>
          <h1 style={{ margin: '12px 0 0' }}>Notifications</h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(203,213,225,0.75)' }}>
            Stay up to date with invites, approvals, and system updates.
          </p>
        </div>
        <button type="button" className="button button--ghost" onClick={() => dispatch(loadNotifications())}>
          Refresh
        </button>
      </header>
      <ul className="list-reset" style={{ display: 'grid', gap: '16px' }}>
        {items.length === 0 && (
          <li className="empty-state">Nothing yet — you’re all caught up!</li>
        )}
        {items.map((notification) => (
          <li key={notification.id} className="surface-card" style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.65, textTransform: 'uppercase' }}>
                {notification.event ?? 'Update'}
              </div>
              {!notification.is_read && (
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => dispatch(markRead(notification.id))}
                >
                  Mark as read
                </button>
              )}
            </div>
            <div style={{ fontWeight: 600 }}>{notification.payload?.message ?? notification.detail}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
              {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationsPage;
