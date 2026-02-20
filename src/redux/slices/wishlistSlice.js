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
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const loading = (state) => { state.loading = true; state.error = null; };
    const failed = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchWishlist.pending, loading)
      .addCase(fetchWishlist.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchWishlist.rejected, failed)

      .addCase(addToWishlist.pending, loading)
      .addCase(addToWishlist.fulfilled, (state) => { state.loading = false; })
      .addCase(addToWishlist.rejected, failed)

      .addCase(removeFromWishlist.pending, loading)
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // remove by id (action.payload.wishlist contains updated ids)
        if (action.payload?.wishlist) {
          const ids = action.payload.wishlist.map(String);
          state.items = state.items.filter(p => ids.includes(String(p._id)));
        }
      })
      .addCase(removeFromWishlist.rejected, failed)

      .addCase(clearWishlist.fulfilled, (state) => { state.items = []; state.loading = false; });
  },
});

export default wishlistSlice.reducer;
