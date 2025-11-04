import client from './client.js';

export const fetchSuggestions = async (token, filters = {}) => {
  const response = await client.get('/match/suggestions/', {
    params: filters,
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const likeProfile = async (token, userId) => {
  const response = await client.post(
    `/match/like/${userId}/`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const rejectProfile = async (token, userId) => {
  const response = await client.post(
    `/match/reject/${userId}/`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const blockProfile = async (token, userId) => {
  const response = await client.post(
    `/match/block/${userId}/`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const fetchMutualMatches = async (token) => {
  const response = await client.get('/match/mutual/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
