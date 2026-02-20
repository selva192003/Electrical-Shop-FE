import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getProducts, getFeaturedProducts, getCategories, getProductById, getBrands, getRelatedProducts, getProductsByCategory } from '../../services/productService.js';

export const fetchProducts = createAsyncThunk('products/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await getProducts(params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchFeaturedProducts = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const res = await getFeaturedProducts(8);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchCategories = createAsyncThunk('products/categories', async (_, { rejectWithValue }) => {
  try {
    const res = await getCategories();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await getProductById(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchBrands = createAsyncThunk('products/brands', async (_, { rejectWithValue }) => {
  try {
    const res = await getBrands();
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchRelatedProducts = createAsyncThunk('products/related', async (id, { rejectWithValue }) => {
  try {
    const res = await getRelatedProducts(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchProductsByCategory = createAsyncThunk('products/byCategory', async ({ slug, params }, { rejectWithValue }) => {
  try {
    const res = await getProductsByCategory(slug, params);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  items: [],
  featured: [],
  categories: [],
  brands: [],
  related: [],
  selectedProduct: null,
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  loading: false,
  error: null,
  selectedLoading: false,
  selectedError: null,
  featuredLoading: false,
  featuredError: null,
  filters: {
    keyword: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sort: '',
  },
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters(state) {
      state.filters = { keyword: '', category: '', brand: '', minPrice: '', maxPrice: '', sort: '' };
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
      state.selectedError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.featuredLoading = true;
        state.featuredError = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featured = action.payload.products || action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.featuredLoading = false;
        state.featuredError = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
        state.selectedProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.related = action.payload;
      })
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.page = action.payload.page;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, setPage, clearSelectedProduct } = productSlice.actions;

export default productSlice.reducer;
