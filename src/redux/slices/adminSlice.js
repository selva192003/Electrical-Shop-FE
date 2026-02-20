import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';

// ── Thunks ──────────────────────────────────────────────

export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/dashboard/summary');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/users');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const blockAdminUser = createAsyncThunk('admin/blockUser', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.patch(`/users/${id}/block`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const unblockAdminUser = createAsyncThunk('admin/unblockUser', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.patch(`/users/${id}/unblock`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchAdminOrders = createAsyncThunk('admin/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/orders');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateAdminOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/orders/${id}/status`, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchAdminCategories = createAsyncThunk('admin/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/products/categories');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchAdminProducts = createAsyncThunk('admin/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/products', { params: { limit: 100, page: 1 } });
    return res.data.products || res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteAdminProduct = createAsyncThunk('admin/deleteProduct', async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createAdminProduct = createAsyncThunk('admin/createProduct', async (formData, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateAdminProduct = createAsyncThunk('admin/updateProduct', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchAdminTickets = createAsyncThunk('admin/fetchTickets', async (params, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get('/support/admin/all', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchAdminTicketById = createAsyncThunk('admin/fetchTicketById', async (id, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.get(`/support/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const replyAdminTicket = createAsyncThunk('admin/replyTicket', async ({ id, message }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(`/support/${id}/reply`, { message });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const closeAdminTicket = createAsyncThunk('admin/closeTicket', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.patch(`/support/${id}/status`, { status });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ── Slice ──────────────────────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    statsLoading: false,
    users: [],
    usersLoading: false,
    orders: [],
    ordersLoading: false,
    products: [],
    productsLoading: false,
    tickets: [],
    ticketsTotal: 0,
    ticketsLoading: false,
    selectedTicket: null,
    ticketLoading: false,
    error: null,
  },
  reducers: {
    clearSelectedTicket(state) {
      state.selectedTicket = null;
    },
  },
  extraReducers: (builder) => {
    // stats
    builder
      .addCase(fetchAdminStats.pending, (s) => { s.statsLoading = true; s.error = null; })
      .addCase(fetchAdminStats.fulfilled, (s, a) => { s.statsLoading = false; s.stats = a.payload; })
      .addCase(fetchAdminStats.rejected, (s, a) => { s.statsLoading = false; s.error = a.payload; });

    // users
    builder
      .addCase(fetchAdminUsers.pending, (s) => { s.usersLoading = true; })
      .addCase(fetchAdminUsers.fulfilled, (s, a) => { s.usersLoading = false; s.users = a.payload; })
      .addCase(fetchAdminUsers.rejected, (s) => { s.usersLoading = false; })
      .addCase(blockAdminUser.fulfilled, (s, a) => {
        s.users = s.users.map((u) => u._id === a.payload ? { ...u, isBlocked: true } : u);
      })
      .addCase(unblockAdminUser.fulfilled, (s, a) => {
        s.users = s.users.map((u) => u._id === a.payload ? { ...u, isBlocked: false } : u);
      });

    // orders
    builder
      .addCase(fetchAdminOrders.pending, (s) => { s.ordersLoading = true; })
      .addCase(fetchAdminOrders.fulfilled, (s, a) => { s.ordersLoading = false; s.orders = a.payload; })
      .addCase(fetchAdminOrders.rejected, (s) => { s.ordersLoading = false; })
      .addCase(updateAdminOrderStatus.fulfilled, (s, a) => {
        s.orders = s.orders.map((o) => o._id === a.payload._id ? a.payload : o);
      });

    // products
    builder
      .addCase(fetchAdminProducts.pending, (s) => { s.productsLoading = true; })
      .addCase(fetchAdminProducts.fulfilled, (s, a) => { s.productsLoading = false; s.products = a.payload; })
      .addCase(fetchAdminProducts.rejected, (s) => { s.productsLoading = false; })
      .addCase(deleteAdminProduct.fulfilled, (s, a) => {
        s.products = s.products.filter((p) => p._id !== a.payload);
      })
      .addCase(createAdminProduct.fulfilled, (s, a) => {
        s.products = [a.payload, ...s.products];
      })
      .addCase(updateAdminProduct.fulfilled, (s, a) => {
        s.products = s.products.map((p) => p._id === a.payload._id ? a.payload : p);
      });

    // tickets
    builder
      .addCase(fetchAdminTickets.pending, (s) => { s.ticketsLoading = true; })
      .addCase(fetchAdminTickets.fulfilled, (s, a) => {
        s.ticketsLoading = false;
        s.tickets = a.payload.tickets || a.payload;
        s.ticketsTotal = a.payload.total || (a.payload.tickets?.length ?? a.payload.length);
      })
      .addCase(fetchAdminTickets.rejected, (s) => { s.ticketsLoading = false; })
      .addCase(fetchAdminTicketById.pending, (s) => { s.ticketLoading = true; s.selectedTicket = null; })
      .addCase(fetchAdminTicketById.fulfilled, (s, a) => { s.ticketLoading = false; s.selectedTicket = a.payload; })
      .addCase(fetchAdminTicketById.rejected, (s) => { s.ticketLoading = false; })
      .addCase(replyAdminTicket.fulfilled, (s, a) => {
        s.selectedTicket = a.payload;
        s.tickets = s.tickets.map((t) => t._id === a.payload._id ? { ...t, status: a.payload.status } : t);
      })
      .addCase(closeAdminTicket.fulfilled, (s, a) => {
        s.selectedTicket = a.payload;
        s.tickets = s.tickets.map((t) => t._id === a.payload._id ? { ...t, status: a.payload.status } : t);
      });
  },
});

export const { clearSelectedTicket } = adminSlice.actions;
export default adminSlice.reducer;
