import client from './client.js';

export const registerUser = async (payload) => {
  const response = await client.post('/auth/register/', payload);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await client.post('/auth/token/', credentials);
  return response.data;
};

export const refreshToken = async (refresh) => {
  const response = await client.post('/auth/token/refresh/', { refresh });
  return response.data;
};

export const fetchCurrentUser = async (token) => {
  const response = await client.get('/auth/me/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await client.post('/auth/verify-email/', { token });
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await client.post('/auth/password-reset/', { email });
  return response.data;
};

export const confirmPasswordReset = async (payload) => {
  const response = await client.post('/auth/password-reset/confirm/', payload);
  return response.data;
};
