import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchMutualMatches, fetchSuggestions } from '../api/match.js';
import { selectAuthTokens } from './authSlice.js';

export const loadSuggestions = createAsyncThunk(
  'match/suggestions',
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const { access } = selectAuthTokens(getState());
      if (!access) {
        return rejectWithValue({ detail: 'Not authenticated' });
      }
      const suggestions = await fetchSuggestions(access, filters);
      return suggestions;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to load suggestions' });
    }
  }
);

export const loadMutualMatches = createAsyncThunk(
  'match/mutual',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { access } = selectAuthTokens(getState());
      if (!access) {
        return rejectWithValue({ detail: 'Not authenticated' });
      }
      const matches = await fetchMutualMatches(access);
      return matches;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to load matches' });
    }
  }
);

const matchSlice = createSlice({
  name: 'match',
  initialState: {
    suggestions: [],
    mutual: [],
    status: 'idle',
    error: null
  },
  reducers: {
    prependSuggestion(state, action) {
      state.suggestions = [action.payload, ...state.suggestions];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSuggestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadSuggestions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.suggestions = action.payload;
      })
      .addCase(loadSuggestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      })
      .addCase(loadMutualMatches.fulfilled, (state, action) => {
        state.mutual = action.payload;
      });
  }
});

export const { prependSuggestion } = matchSlice.actions;
export const selectSuggestions = (state) => state.match.suggestions;
export const selectMutualMatches = (state) => state.match.mutual;

export default matchSlice.reducer;
