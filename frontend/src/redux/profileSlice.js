import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchProfile, fetchInterests, updateProfile } from '../api/profile.js';
import { selectAuthTokens } from './authSlice.js';

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
      const profile = await updateProfile(access, payload);
      return profile;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to save profile' });
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
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.error = action.payload ?? action.error;
      });
  }
});

export const selectProfile = (state) => state.profile.profile;
export const selectInterests = (state) => state.profile.interests;

export default profileSlice.reducer;
