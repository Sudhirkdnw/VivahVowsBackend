import PropTypes from 'prop-types';

const ToastStack = ({ notifications }) => {
  if (!notifications.length) {
    return null;
  }

  return (
    <div className="toast-stack">
      {notifications.map((notification) => (
        <div key={notification.id} className="toast">
          <div style={{ fontSize: '0.8rem', opacity: 0.65, textTransform: 'uppercase' }}>
            {notification.event ?? 'Update'}
          </div>
          <div style={{ fontWeight: 600 }}>{notification.payload?.message ?? notification.detail}</div>
        </div>
      ))}
    </div>
  );
};

ToastStack.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.object)
};

ToastStack.defaultProps = {
  notifications: []
};

export default ToastStack;
