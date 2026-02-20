import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createReturnRequest as createReturnApi,
  getMyReturnRequests as getMyReturnsApi,
  getReturnRequest as getReturnApi,
} from '../../services/returnService.js';

export const submitReturnRequest = createAsyncThunk(
  'returns/submit',
  async (data, { rejectWithValue }) => {
    try {
      const res = await createReturnApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMyReturns = createAsyncThunk(
  'returns/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyReturnsApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchReturn = createAsyncThunk(
  'returns/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await getReturnApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const returnSlice = createSlice({
  name: 'returns',
  initialState: { items: [], currentReturn: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const loading = (state) => { state.loading = true; state.error = null; };
    const failed = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(submitReturnRequest.pending, loading)
      .addCase(submitReturnRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(submitReturnRequest.rejected, failed)

      .addCase(fetchMyReturns.pending, loading)
      .addCase(fetchMyReturns.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyReturns.rejected, failed)

      .addCase(fetchReturn.pending, loading)
      .addCase(fetchReturn.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReturn = action.payload;
      })
      .addCase(fetchReturn.rejected, failed);
  },
});

export default returnSlice.reducer;
