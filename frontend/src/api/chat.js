import client from './client.js';

export const fetchChatRooms = async (token) => {
  const response = await client.get('/chat/rooms/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchMessages = async (token, roomId) => {
  const response = await client.get(`/chat/rooms/${roomId}/messages/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const sendMessage = async (token, roomId, content) => {
  const response = await client.post(
    `/chat/rooms/${roomId}/messages/`,
    { content },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
