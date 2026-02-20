import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import productReducer from './slices/productSlice.js';
import cartReducer from './slices/cartSlice.js';
import orderReducer from './slices/orderSlice.js';
import dashboardReducer from './slices/dashboardSlice.js';
import wishlistReducer from './slices/wishlistSlice.js';
import notificationReducer from './slices/notificationSlice.js';
import supportReducer from './slices/supportSlice.js';
import returnReducer from './slices/returnSlice.js';
import adminReducer from './slices/adminSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    dashboard: dashboardReducer,
    wishlist: wishlistReducer,
    notifications: notificationReducer,
    support: supportReducer,
    returns: returnReducer,
    admin: adminReducer,
  },
});
