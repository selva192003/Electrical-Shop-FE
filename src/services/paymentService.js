import axiosInstance from './axiosInstance.js';

export const createRazorpayOrder = (orderId) =>
  axiosInstance.post('/payments/create-order', { orderId }).then((res) => res.data);

export const verifyPayment = (data) => axiosInstance.post('/payments/verify', data).then((res) => res.data);
