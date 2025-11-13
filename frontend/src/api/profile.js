import client from './client.js';

export const fetchProfile = async (token) => {
  const response = await client.get('/profiles/me/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProfile = async (token, data) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const headers = { Authorization: `Bearer ${token}` };
  if (isFormData) {
    headers['Content-Type'] = 'multipart/form-data';
  }
  const response = await client.patch('/profiles/me/', data, {
    headers,
    transformRequest: isFormData ? [(formData) => formData] : undefined
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
