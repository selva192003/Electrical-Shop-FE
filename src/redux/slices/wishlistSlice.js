import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getWishlist as getWishlistApi,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
  clearWishlist as clearWishlistApi,
} from '../../services/wishlistService.js';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await getWishlistApi();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const addToWishlist = createAsyncThunk('wishlist/add', async (productId, { rejectWithValue }) => {
  try {
    const res = await addToWishlistApi(productId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async (productId, { rejectWithValue }) => {
  try {
    const res = await removeFromWishlistApi(productId);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const clearWishlist = createAsyncThunk('wishlist/clear', async (_, { rejectWithValue }) => {
  try {
    await clearWishlistApi();
    return [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false, error: null, _removedItem: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── Fetch ──
      .addCase(fetchWishlist.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(fetchWishlist.fulfilled,  (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchWishlist.rejected,   (state, action) => { state.loading = false; state.error = action.payload; })

      // ── Add (optimistic) ──
      .addCase(addToWishlist.pending, (state, action) => {
        state.loading = true; state.error = null;
        const id = action.meta.arg;
        if (!state.items.some((w) => String(w._id || w) === String(id))) {
          state.items.push({ _id: id }); // optimistic stub
        }
      })
      .addCase(addToWishlist.fulfilled, (state) => { state.loading = false; })
      .addCase(addToWishlist.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload;
        // revert — remove the stub
        const id = action.meta.arg;
        state.items = state.items.filter((w) => String(w._id || w) !== String(id));
      })

      // ── Remove (optimistic) ──
      .addCase(removeFromWishlist.pending, (state, action) => {
        state.loading = true; state.error = null;
        const id = action.meta.arg;
        state._removedItem = state.items.find((w) => String(w._id || w) === String(id)) || null;
        state.items = state.items.filter((w) => String(w._id || w) !== String(id));
      })
      .addCase(removeFromWishlist.fulfilled, (state) => {
        state.loading = false; state._removedItem = null;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
        // revert — put the item back
        if (state._removedItem) {
          state.items.push(state._removedItem);
          state._removedItem = null;
        }
      })

      // ── Clear ──
      .addCase(clearWishlist.fulfilled, (state) => { state.items = []; state.loading = false; });
  },
});

export default wishlistSlice.reducer;
