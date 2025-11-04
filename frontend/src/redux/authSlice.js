import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  confirmPasswordReset,
  fetchCurrentUser,
  loginUser,
  refreshToken,
  registerUser,
  requestPasswordReset,
  verifyEmail
} from '../api/auth.js';

const STORAGE_KEY = 'vivahvows_auth';

const persisted = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
  } catch (error) {
    return null;
  }
})();

const initialState = {
  access: persisted?.access ?? null,
  refresh: persisted?.refresh ?? null,
  user: persisted?.user ?? null,
  status: 'idle',
  error: null
};

const persistState = (state) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ access: state.access, refresh: state.refresh, user: state.user })
  );
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const tokens = await loginUser(credentials);
    const user = await fetchCurrentUser(tokens.access);
    return { ...tokens, user };
  } catch (error) {
    return rejectWithValue(error.response?.data ?? { detail: 'Unable to login' });
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    await registerUser(payload);
    return true;
  } catch (error) {
    return rejectWithValue(error.response?.data ?? { detail: 'Registration failed' });
  }
});

export const refreshSession = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    const refresh = getState().auth.refresh;
    if (!refresh) {
      return rejectWithValue({ detail: 'No refresh token available' });
    }
    try {
      const tokens = await refreshToken(refresh);
      const user = await fetchCurrentUser(tokens.access);
      return { ...tokens, user };
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Session refresh failed' });
    }
  }
);

export const verifyEmailToken = createAsyncThunk(
  'auth/verifyEmail',
  async (token, { rejectWithValue }) => {
    try {
      return await verifyEmail(token);
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Verification failed' });
    }
  }
);

export const requestPasswordResetToken = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      return await requestPasswordReset(email);
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to send reset email' });
    }
  }
);

export const confirmPasswordResetToken = createAsyncThunk(
  'auth/confirmPasswordReset',
  async (payload, { rejectWithValue }) => {
    try {
      return await confirmPasswordReset(payload);
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to reset password' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.access = null;
      state.refresh = null;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem(STORAGE_KEY);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.access = action.payload.access;
        state.refresh = action.payload.refresh;
        state.user = action.payload.user;
        persistState(state);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.access = action.payload.access;
        state.refresh = action.payload.refresh ?? state.refresh;
        state.user = action.payload.user;
        persistState(state);
      })
      .addCase(refreshSession.rejected, (state) => {
        state.access = null;
        state.refresh = null;
        state.user = null;
        localStorage.removeItem(STORAGE_KEY);
      });
  }
});

export const { logout } = authSlice.actions;

export const selectIsAuthenticated = (state) => Boolean(state.auth.access);
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthTokens = (state) => ({ access: state.auth.access, refresh: state.auth.refresh });

export default authSlice.reducer;
