import axios from 'axios';

const apiOrigin = (import.meta.env.VITE_API_ORIGIN ?? '').replace(/\/$/, '');

const client = axios.create({
  baseURL: apiOrigin ? `${apiOrigin}/api` : '/api',
  withCredentials: true
});

export default client;
