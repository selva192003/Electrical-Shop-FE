import axiosInstance from './axiosInstance.js';

export const validateCoupon = (data) => axiosInstance.post('/coupons/validate', data);

export const applyCoupon = (couponId) => axiosInstance.post('/coupons/apply', { couponId });

// Admin
export const getAllCoupons = () => axiosInstance.get('/coupons');

export const createCoupon = (data) => axiosInstance.post('/coupons', data);

export const updateCoupon = (id, data) => axiosInstance.put(`/coupons/${id}`, data);

export const deleteCoupon = (id) => axiosInstance.delete(`/coupons/${id}`);
