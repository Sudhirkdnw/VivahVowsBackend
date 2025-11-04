import client from './client.js';

export const fetchNotifications = async (token) => {
  const response = await client.get('/notifications/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const markNotificationRead = async (token, notificationId) => {
  const response = await client.patch(
    `/notifications/${notificationId}/`,
    { is_read: true },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
