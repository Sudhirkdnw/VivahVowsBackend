import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchNotifications, markNotificationRead } from '../api/notifications.js';
import { selectAuthTokens } from './authSlice.js';

export const loadNotifications = createAsyncThunk(
  'notifications/load',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { access } = selectAuthTokens(getState());
      if (!access) {
        return rejectWithValue({ detail: 'Not authenticated' });
      }
      return await fetchNotifications(access);
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to load notifications' });
    }
  }
);

export const markRead = createAsyncThunk(
  'notifications/markRead',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const { access } = selectAuthTokens(getState());
      if (!access) {
        return rejectWithValue({ detail: 'Not authenticated' });
      }
      await markNotificationRead(access, notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to update notification' });
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0
  },
  reducers: {
    pushNotification(state, action) {
      state.items = [action.payload, ...state.items];
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.unreadCount = action.payload.filter((item) => !item.is_read).length;
      })
      .addCase(markRead.fulfilled, (state, action) => {
        state.items = state.items.map((item) =>
          item.id === action.payload ? { ...item, is_read: true } : item
        );
        state.unreadCount = state.items.filter((item) => !item.is_read).length;
      });
  }
});

export const { pushNotification } = notificationSlice.actions;
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.unreadCount;

export default notificationSlice.reducer;
