import { useEffect, useState } from 'react';
import apiClient from '../api/client';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await apiClient.get('/api/notifications/');
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.patch(`/api/notifications/${notificationId}/`, { is_read: true });
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const eventLabels = {
    like: 'New like',
    match: "It's a match!",
    message: 'New message'
  };

  return (
    <section className="card">
      <header className="card-header">
        <div>
          <h1>Notifications</h1>
          <p className="helper-text">Stay on top of new likes, matches, and conversations.</p>
        </div>
      </header>
      {loading ? (
        <p>Loading notifications…</p>
      ) : notifications.length === 0 ? (
        <p>You are all caught up!</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`notification-item ${notification.is_read ? '' : 'unread'}`}
            >
              <div>
                <strong>{eventLabels[notification.event] || notification.event}</strong>
                <p className="helper-text">{JSON.stringify(notification.payload)}</p>
                <small>{new Date(notification.created_at).toLocaleString()}</small>
              </div>
              {!notification.is_read ? (
                <button className="btn secondary" type="button" onClick={() => markAsRead(notification.id)}>
                  Mark as read
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default NotificationsPage;
