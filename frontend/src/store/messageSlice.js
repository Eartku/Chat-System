import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchMessages as fetchMessagesApi, sendMessage as sendMessageApi } from '../api/messageApi.js';

const toKey = (id) => Number(id);

export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    console.debug('[messageSlice] fetchMessages start', { conversationId });
    try {
      const result = await fetchMessagesApi(conversationId);
      console.debug('[messageSlice] fetchMessages success', { conversationId, length: result.length });
      return result;
    } catch (error) {
      console.error('[messageSlice] fetchMessages error', {
        conversationId,
        message: error.message,
        response: error.response?.data
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async ({ conversationId, content }, { rejectWithValue }) => {
    console.debug('[messageSlice] sendMessage start', { conversationId, content });
    try {
      const result = await sendMessageApi(conversationId, { content });
      console.debug('[messageSlice] sendMessage success', { conversationId, messId: result.messId });
      return result;
    } catch (error) {
      console.error('[messageSlice] sendMessage error', {
        conversationId,
        content,
        message: error.message,
        response: error.response?.data
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState: {
    messagesByConversation: {},
    loading: false,
    error: null
  },
  reducers: {
    addMessage(state, action) {
      const key = toKey(action.payload.conversationId);
      if (!state.messagesByConversation[key]) {
        state.messagesByConversation[key] = [];
      }
      // Tránh duplicate nếu WS và sendMessage.fulfilled cùng push
      const exists = state.messagesByConversation[key].some(
        (m) => m.messId === action.payload.messId
      );
      if (!exists) {
        state.messagesByConversation[key].push(action.payload);
      }
    },
    setMessages(state, action) {
      const { conversationId, messages } = action.payload;
      state.messagesByConversation[toKey(conversationId)] = messages;
    },
    clearMessages(state, action) {
      delete state.messagesByConversation[toKey(action.payload)];
    },
    removeMessage(state, action) {
        const { conversationId, messId } = action.payload;
        const key = toKey(conversationId);
        if (state.messagesByConversation[key]) {
            state.messagesByConversation[key] = state.messagesByConversation[key]
            .filter((m) => m.messId !== messId);
        }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const key = toKey(action.meta.arg);
        state.messagesByConversation[key] = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot load messages';
      })
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const key = toKey(action.meta.arg.conversationId);
        if (!state.messagesByConversation[key]) {
          state.messagesByConversation[key] = [];
        }
        const exists = state.messagesByConversation[key].some(
          (m) => m.messId === action.payload.messId
        );
        if (!exists) {
          state.messagesByConversation[key].push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot send message';
      });
  }
});

export const { addMessage, setMessages, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
