import axios from 'axios';

const resolveDefaultBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:8000';
};

const API_BASE_URL = resolveDefaultBaseUrl().replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

const TOKEN_STORAGE_KEY = 'vivahvows.tokens';

export const tokenStorage = {
  get() {
    try {
      const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Failed to parse stored tokens', error);
      return null;
    }
  },
  set(tokens) {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  },
  clear() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

apiClient.interceptors.request.use((config) => {
  const tokens = tokenStorage.get();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      const tokens = tokenStorage.get();
      if (!tokens?.refresh) {
        tokenStorage.clear();
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newAccessToken) => {
            if (!newAccessToken) {
              reject(error);
              return;
            }
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/token/refresh/`,
          { refresh: tokens.refresh }
        );
        const newTokens = { ...tokens, access: response.data.access };
        tokenStorage.set(newTokens);
        isRefreshing = false;
        onRefreshed(newTokens.access);
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        tokenStorage.clear();
        onRefreshed(null);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
