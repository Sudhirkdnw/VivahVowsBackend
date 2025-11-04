import client from './client.js';

export const fetchProfile = async (token) => {
  const response = await client.get('/profiles/me/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProfile = async (token, data) => {
  const response = await client.put('/profiles/me/', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchInterests = async (token) => {
  const response = await client.get('/interests/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchProfiles = async (token, params = {}) => {
  const response = await client.get('/profiles/', {
    params,
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
