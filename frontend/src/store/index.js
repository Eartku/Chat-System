import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import conversationReducer from './conversationSlice.js';
import messageReducer from './messageSlice.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    conversation: conversationReducer,
    message: messageReducer
  }
});

export default store;
