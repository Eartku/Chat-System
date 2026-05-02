import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchConversations as fetchConversationsApi, fetchConversationDetail as fetchConversationDetailApi, createConversation as createConversationApi } from '../api/conversationApi.js';

export const fetchConversations = createAsyncThunk(
  'conversation/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchConversationsApi();
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchConversationDetail = createAsyncThunk(
  'conversation/fetchConversationDetail',
  async (conversationId, { rejectWithValue }) => {
    try {
      return await fetchConversationDetailApi(conversationId);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createConversation = createAsyncThunk(
  'conversation/createConversation',
  async (payload, { rejectWithValue }) => {
    try {
      return await createConversationApi(payload);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const conversationSlice = createSlice({
  name: 'conversation',
  initialState: {
    conversations: [],
    selectedConversation: null,
    selectedConversationDetail: null,
    loading: false,
    error: null
  },
  reducers: {
    selectConversation(state, action) {
      state.selectedConversation = action.payload;
      state.selectedConversationDetail = null;
    },
    updateConversationLastMessage(state, action) {
      const { conversationId, content, createdAt } = action.payload;
      const key = Number(conversationId);
      const idx = state.conversations.findIndex((c) => Number(c.id) === key);
      if (idx !== -1) {
        state.conversations[idx].lastMessage = content;
        state.conversations[idx].updatedAt = createdAt || new Date().toISOString();
      }
      if (state.selectedConversationDetail && Number(state.selectedConversationDetail.id) === key) {
        state.selectedConversationDetail.lastMessage = content;
        state.selectedConversationDetail.updatedAt = createdAt || new Date().toISOString();
      }
      state.conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot load conversations';
      })
      .addCase(fetchConversationDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversationDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedConversationDetail = action.payload;
      })
      .addCase(fetchConversationDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot load conversation detail';
      })
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = [action.payload, ...state.conversations].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        state.selectedConversation = action.payload.id;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot create conversation';
      });
  }
});

export const { selectConversation, updateConversationLastMessage } = conversationSlice.actions;
export default conversationSlice.reducer;
