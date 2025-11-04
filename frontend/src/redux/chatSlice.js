import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchChatRooms, fetchMessages } from '../api/chat.js';
import { selectAuthTokens } from './authSlice.js';

export const loadChatRooms = createAsyncThunk(
  'chat/rooms',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { access } = selectAuthTokens(getState());
      if (!access) {
        return rejectWithValue({ detail: 'Not authenticated' });
      }
      return await fetchChatRooms(access);
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to load chat rooms' });
    }
  }
);

export const loadRoomMessages = createAsyncThunk(
  'chat/messages',
  async (roomId, { getState, rejectWithValue }) => {
    try {
      const { access } = selectAuthTokens(getState());
      if (!access) {
        return rejectWithValue({ detail: 'Not authenticated' });
      }
      return { roomId, messages: await fetchMessages(access, roomId) };
    } catch (error) {
      return rejectWithValue(error.response?.data ?? { detail: 'Unable to load messages' });
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],
    messages: {},
    status: 'idle',
    error: null
  },
  reducers: {
    appendMessage(state, action) {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(message);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadChatRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
      })
      .addCase(loadRoomMessages.fulfilled, (state, action) => {
        state.messages[action.payload.roomId] = action.payload.messages;
      });
  }
});

export const { appendMessage } = chatSlice.actions;
export const selectChatRooms = (state) => state.chat.rooms;
export const selectRoomMessages = (state, roomId) => state.chat.messages[roomId] ?? [];

export default chatSlice.reducer;
