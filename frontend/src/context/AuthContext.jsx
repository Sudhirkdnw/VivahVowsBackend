import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import apiClient, { tokenStorage } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(user?.id);

  const fetchUserData = useCallback(async () => {
    try {
      const [userResponse, profileResponse] = await Promise.all([
        apiClient.get('/api/auth/me/'),
        apiClient.get('/api/profiles/me/')
      ]);
      setUser(userResponse.data);
      setProfile(profileResponse.data);
    } catch (err) {
      console.error('Failed to fetch user data', err);
      tokenStorage.clear();
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const tokens = tokenStorage.get();
    if (!tokens?.access) {
      setLoading(false);
      return;
    }
    fetchUserData().finally(() => setLoading(false));
  }, [fetchUserData]);

  const login = useCallback(async (credentials) => {
    setError(null);
    setLoading(true);
    try {
      const response = await apiClient.post('/api/auth/token/', credentials);
      tokenStorage.set(response.data);
      await fetchUserData();
    } finally {
      setLoading(false);
    }
  }, [fetchUserData]);

  const register = useCallback(async (payload) => {
    setError(null);
    await apiClient.post('/api/auth/register/', payload);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  const updateUser = useCallback(
    async (patch) => {
      const response = await apiClient.patch('/api/auth/me/', patch);
      setUser(response.data);
      return response.data;
    },
    []
  );

  const updateProfile = useCallback(
    async (formData) => {
      const response = await apiClient.patch('/api/profiles/me/', formData);
      setProfile(response.data);
      return response.data;
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    const response = await apiClient.get('/api/profiles/me/');
    setProfile(response.data);
    return response.data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      updateProfile,
      refreshProfile,
      setError
    }),
    [
      user,
      profile,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
      updateProfile,
      refreshProfile
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
