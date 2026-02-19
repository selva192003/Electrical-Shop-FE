import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  register as registerApi,
  login as loginApi,
  getProfile,
  updateProfile as updateProfileApi,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../services/authService.js';

const tokenKey = 'eshop_token';

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await registerApi(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await loginApi(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const loadProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const res = await getProfile();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await updateProfileApi(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchAddresses = createAsyncThunk('auth/fetchAddresses', async (_, { rejectWithValue }) => {
  try {
    const res = await getAddresses();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addUserAddress = createAsyncThunk('auth/addAddress', async (data, { rejectWithValue }) => {
  try {
    const res = await addAddress(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateUserAddress = createAsyncThunk('auth/updateAddress', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await updateAddress(id, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const deleteUserAddress = createAsyncThunk('auth/deleteAddress', async (id, { rejectWithValue }) => {
  try {
    await deleteAddress(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const setDefaultUserAddress = createAsyncThunk('auth/setDefaultAddress', async (id, { rejectWithValue }) => {
  try {
    const res = await setDefaultAddress(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  user: null,
  token: localStorage.getItem(tokenKey) || null,
  loading: false,
  error: null,
  addresses: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.addresses = [];
      localStorage.removeItem(tokenKey);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem(tokenKey, action.payload.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem(tokenKey, action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
      })
      .addCase(loadProfile.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem(tokenKey);
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user || action.payload;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
      })
      .addCase(addUserAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((addr) => (addr._id === action.payload._id ? action.payload : addr));
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((addr) => addr._id !== action.payload);
      })
      .addCase(setDefaultUserAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr._id === action.payload._id,
        }));
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
