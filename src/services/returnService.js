import axiosInstance from './axiosInstance.js';

export const createReturnRequest = (data) => axiosInstance.post('/returns', data);

export const getMyReturnRequests = () => axiosInstance.get('/returns');

export const getReturnRequest = (id) => axiosInstance.get(`/returns/${id}`);

// Admin
export const getAllReturnRequests = (params) => axiosInstance.get('/returns/admin/all', { params });

export const updateReturnStatus = (id, data) => axiosInstance.patch(`/returns/${id}/status`, data);
