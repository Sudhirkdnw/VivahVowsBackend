import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice.js';
import chatReducer from './chatSlice.js';
import matchReducer from './matchSlice.js';
import notificationReducer from './notificationSlice.js';
import profileReducer from './profileSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    match: matchReducer,
    chat: chatReducer,
    notifications: notificationReducer
  }
});

export default store;
