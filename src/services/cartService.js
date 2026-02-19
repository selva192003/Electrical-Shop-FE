import axiosInstance from './axiosInstance.js';

export const getCart = () => axiosInstance.get('/cart');

export const addToCart = (data) => axiosInstance.post('/cart/add', data);

export const updateCartItem = (itemId, quantity) => axiosInstance.put(`/cart/item/${itemId}`, { quantity });

export const removeCartItem = (itemId) => axiosInstance.delete(`/cart/item/${itemId}`);

export const clearCart = () => axiosInstance.delete('/cart/clear');
