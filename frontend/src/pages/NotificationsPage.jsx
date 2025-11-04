import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadNotifications, markRead, selectNotifications } from '../redux/notificationSlice.js';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  useEffect(() => {
    dispatch(loadNotifications());
  }, [dispatch]);

  const handleRead = (notificationId) => {
    dispatch(markRead(notificationId));
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Notifications</h2>
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notifications.map((notification) => (
              <li key={notification.id} style={{ marginBottom: '1rem' }}>
                <strong>{notification.event}</strong>
                <pre style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '8px' }}>
                  {JSON.stringify(notification.payload, null, 2)}
                </pre>
                {!notification.is_read && (
                  <button type="button" className="button-secondary" onClick={() => handleRead(notification.id)}>
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
