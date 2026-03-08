import axiosInstance from './axiosInstance.js';

export const createOrder = (data) => axiosInstance.post('/orders', data);

export const getMyOrders = () => axiosInstance.get('/orders/my');

export const getOrderById = (id) => axiosInstance.get(`/orders/${id}`);

export const cancelOrder = (id, reason) => axiosInstance.patch(`/orders/${id}/cancel`, { reason });

export const requestCancelOtp = (id) =>
  axiosInstance.post(`/orders/${id}/cancel/request-otp`);

export const verifyCancelOtp = (id, otp, reason) =>
  axiosInstance.post(`/orders/${id}/cancel/verify-otp`, { otp, reason });

export const getAllOrdersAdmin = () => axiosInstance.get('/orders');

export const updateOrderStatusAdmin = (id, status) => axiosInstance.patch(`/orders/${id}/status`, { status });

