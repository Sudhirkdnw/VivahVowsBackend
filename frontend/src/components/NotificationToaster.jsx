import React from 'react';

const NotificationToaster = ({ notifications }) => {
  if (!notifications.length) return null;
  return (
    <div className="notification-toast">
      {notifications.slice(0, 3).map((notification) => (
        <div key={notification.id ?? notification.payload?.id} className="notification-toast__item">
          <strong>{notification.event}</strong>
          <span>{JSON.stringify(notification.payload)}</span>
        </div>
      ))}
    </div>
  );
};

export default NotificationToaster;
