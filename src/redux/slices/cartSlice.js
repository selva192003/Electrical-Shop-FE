import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../../services/cartService.js';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await getCart();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const addItemToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try {
    const res = await addToCart(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateCartItemQty = createAsyncThunk('cart/updateQty', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await updateCartItem(itemId, quantity);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeCartItemAsync = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    const res = await removeCartItem(itemId);
    return { response: res.data, itemId };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const clearCartAsync = createAsyncThunk('cart/clear', async (_, { rejectWithValue }) => {
  try {
    const res = await clearCart();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.items = action.payload.items || state.items;
      })
      .addCase(updateCartItemQty.fulfilled, (state, action) => {
        state.items = action.payload.items || state.items;
      })
      .addCase(removeCartItemAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload.itemId);
      })
      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity * (item.product?.price || item.price || 0), 0);

export default cartSlice.reducer;
