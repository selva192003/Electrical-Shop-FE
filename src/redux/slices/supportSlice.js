import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createTicket as createTicketApi,
  getMyTickets as getMyTicketsApi,
  getTicket as getTicketApi,
  replyToTicket as replyToTicketApi,
} from '../../services/supportService.js';

export const createSupportTicket = createAsyncThunk(
  'support/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await createTicketApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchMyTickets = createAsyncThunk(
  'support/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getMyTicketsApi();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchTicket = createAsyncThunk(
  'support/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const res = await getTicketApi(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const replyTicket = createAsyncThunk(
  'support/reply',
  async ({ id, message }, { rejectWithValue }) => {
    try {
      const res = await replyToTicketApi(id, { message });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const supportSlice = createSlice({
  name: 'support',
  initialState: { tickets: [], currentTicket: null, loading: false, error: null },
  reducers: {
    clearCurrentTicket(state) { state.currentTicket = null; },
  },
  extraReducers: (builder) => {
    const loading = (state) => { state.loading = true; state.error = null; };
    const failed = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(createSupportTicket.pending, loading)
      .addCase(createSupportTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.unshift(action.payload);
      })
      .addCase(createSupportTicket.rejected, failed)

      .addCase(fetchMyTickets.pending, loading)
      .addCase(fetchMyTickets.fulfilled, (state, action) => { state.loading = false; state.tickets = action.payload; })
      .addCase(fetchMyTickets.rejected, failed)

      .addCase(fetchTicket.pending, loading)
      .addCase(fetchTicket.fulfilled, (state, action) => { state.loading = false; state.currentTicket = action.payload; })
      .addCase(fetchTicket.rejected, failed)

      .addCase(replyTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload;
      });
  },
});

export const { clearCurrentTicket } = supportSlice.actions;
export default supportSlice.reducer;
