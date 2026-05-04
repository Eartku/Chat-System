import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchMessages as fetchMessagesApi,
  sendMessage as sendMessageApi,
  deleteMessage as deleteMessageApi,
  markMessageRead as markMessageReadApi
} from '../api/messageApi.js';

const toKey = (id) => Number(id);

function updateMessageInState(state, conversationId, messageId, patch) {
  const key = toKey(conversationId);
  const messages = state.messagesByConversation[key];
  if (!messages) return;
  state.messagesByConversation[key] = messages.map((msg) => {
    const id = msg.id || msg.messId;
    return id === messageId ? { ...msg, ...patch } : msg;
  });
}

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
      console.debug('[messageSlice] sendMessage success', { conversationId, id: result.id });
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

export const deleteMessage = createAsyncThunk(
  'message/deleteMessage',
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    console.debug('[messageSlice] deleteMessage start', { conversationId, messageId });
    try {
      await deleteMessageApi(messageId);
      console.debug('[messageSlice] deleteMessage success', { conversationId, messageId });
      return { conversationId, messageId };
    } catch (error) {
      console.error('[messageSlice] deleteMessage error', {
        conversationId,
        messageId,
        message: error.message,
        response: error.response?.data
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markMessageRead = createAsyncThunk(
  'message/markMessageRead',
  async ({ conversationId, messageId }, { rejectWithValue }) => {
    console.debug('[messageSlice] markMessageRead start', { conversationId, messageId });
    try {
      const result = await markMessageReadApi(messageId);
      console.debug('[messageSlice] markMessageRead success', { conversationId, messageId });
      return { conversationId, message: result };
    } catch (error) {
      console.error('[messageSlice] markMessageRead error', {
        conversationId,
        messageId,
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
      const messageId = action.payload.id || action.payload.messId;
      const exists = state.messagesByConversation[key].some(
        (m) => (m.id || m.messId) === messageId
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
      const { conversationId, id } = action.payload;
      const key = toKey(conversationId);
      if (state.messagesByConversation[key]) {
        state.messagesByConversation[key] = state.messagesByConversation[key]
          .filter((m) => (m.id || m.messId) !== id);
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
        const messageId = action.payload.id || action.payload.messId;
        const exists = state.messagesByConversation[key].some(
          (m) => (m.id || m.messId) === messageId
        );
        if (!exists) {
          state.messagesByConversation[key].push(action.payload);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot send message';
      })
      .addCase(deleteMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.loading = false;
        updateMessageInState(state, action.payload.conversationId, action.payload.messageId, { deleted: true });
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot delete message';
      })
      .addCase(markMessageRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markMessageRead.fulfilled, (state, action) => {
        state.loading = false;
        updateMessageInState(state, action.payload.conversationId, action.payload.message.id || action.payload.message.messId, action.payload.message);
      })
      .addCase(markMessageRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot mark message as read';
      });
  }
});

export const { addMessage, setMessages, clearMessages, removeMessage } = messageSlice.actions;
export default messageSlice.reducer;
