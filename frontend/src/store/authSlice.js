import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, register as registerApi, fetchMe as fetchMeApi } from '../api/authApi.js';

const token = localStorage.getItem('token');

function getErrorMessage(error, fallback) {
  const responseData = error.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  return error.message || fallback;
}

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const data = await loginApi(payload);
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Login failed'));
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const data = await registerApi(payload);
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Registration failed'));
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const data = await fetchMeApi();
    return data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Unable to fetch user'));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token,
    user: null,
    isAuthenticated: Boolean(token),
    loading: false,
    error: null
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          id: action.payload.id,   
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role
        };
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = {
          displayName: action.meta.arg.displayName || action.payload.username,
          username: action.payload.username,
          email: action.payload.email,
          avatarUrl: action.meta.arg.avatarUrl || null,
          role: action.payload.role
        };
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      })
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Unable to fetch user';
        localStorage.removeItem('token');
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
