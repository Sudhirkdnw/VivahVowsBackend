import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteAccount, fetchProfile, fetchInterests, updateProfile } from '../api/profile.js';
import { logout, selectAuthTokens } from './authSlice.js';

export const loadProfile = createAsyncThunk(
  'profile/load',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { access } = selectAuthTokens(getState());
      if (!access) {
        return rejectWithValue({ detail: 'Not authenticated' });
      }
      const [profile, interests] = await Promise.all([
        fetchProfile(access),
        fetchInterests(access)
      ]);
      return { profile, interests };
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to load profile' });
    }
  }
);

export const saveProfile = createAsyncThunk(
  'profile/save',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { access } = selectAuthTokens(getState());
      if (!access) {
        return rejectWithValue({ detail: 'Not authenticated' });
      }
      const response = await updateProfile(access, payload);
      if (!response || typeof response !== 'object' || Array.isArray(response)) {
        const fallback = await fetchProfile(access);
        if (!fallback || typeof fallback !== 'object' || Array.isArray(fallback)) {
          throw new Error('Invalid profile payload received from server');
        }
        return fallback;
      }
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ?? { detail: error.message ?? 'Unable to save profile' }
      );
    }
  }
);

export const removeAccount = createAsyncThunk(
  'profile/removeAccount',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { access } = selectAuthTokens(getState());
      if (!access) {
        return rejectWithValue({ detail: 'Not authenticated' });
      }
      await deleteAccount(access);
      dispatch(logout());
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to delete account' });
    }
  }
);

export const removeAccount = createAsyncThunk(
  'profile/removeAccount',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const { access } = selectAuthTokens(getState());
      if (!access) {
        return rejectWithValue({ detail: 'Not authenticated' });
      }
      await deleteAccount(access);
      dispatch(logout());
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to delete account' });
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    interests: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload.profile;
        state.interests = action.payload.interests.results ?? action.payload.interests;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        if (action.payload && typeof action.payload === 'object' && !Array.isArray(action.payload)) {
          state.profile = action.payload;
        }
        state.error = null;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.error = action.payload ?? action.error;
      })
      .addCase(removeAccount.pending, (state) => {
        state.status = 'deleting';
      })
      .addCase(removeAccount.fulfilled, (state) => {
        state.status = 'deleted';
        state.profile = null;
        state.interests = [];
        state.error = null;
      })
      .addCase(removeAccount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      });
  }
});

export const selectProfile = (state) => state.profile.profile;
export const selectInterests = (state) => state.profile.interests;

export default profileSlice.reducer;
