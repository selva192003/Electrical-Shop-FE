import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createOrder, getMyOrders, getOrderById } from '../../services/orderService.js';

export const createOrderThunk = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try {
    const res = await createOrder(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchMyOrders = createAsyncThunk('orders/my', async (_, { rejectWithValue }) => {
  try {
    const res = await getMyOrders();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchOrderById = createAsyncThunk('orders/byId', async (id, { rejectWithValue }) => {
  try {
    const res = await getOrderById(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  list: [],
  current: null,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export default orderSlice.reducer;
