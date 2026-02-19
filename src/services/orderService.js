import axiosInstance from './axiosInstance.js';

export const createOrder = (data) => axiosInstance.post('/orders', data);

export const getMyOrders = () => axiosInstance.get('/orders/my');

export const getOrderById = (id) => axiosInstance.get(`/orders/${id}`);

export const getAllOrdersAdmin = () => axiosInstance.get('/orders');

export const updateOrderStatusAdmin = (id, status) => axiosInstance.patch(`/orders/${id}/status`, { status });
