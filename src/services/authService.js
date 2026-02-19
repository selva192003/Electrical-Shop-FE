import axiosInstance from './axiosInstance.js';

export const register = (data) => axiosInstance.post('/users/register', data);

export const login = (data) => axiosInstance.post('/users/login', data);

export const getProfile = () => axiosInstance.get('/users/profile');

export const updateProfile = (data) => axiosInstance.put('/users/profile', data);

export const getAddresses = () => axiosInstance.get('/users/addresses');

export const addAddress = (data) => axiosInstance.post('/users/addresses', data);

export const updateAddress = (id, data) => axiosInstance.put(`/users/addresses/${id}`, data);

export const deleteAddress = (id) => axiosInstance.delete(`/users/addresses/${id}`);

export const setDefaultAddress = (id) => axiosInstance.patch(`/users/addresses/${id}/default`);

export const getUsersAdmin = () => axiosInstance.get('/users');

export const blockUser = (id) => axiosInstance.patch(`/users/${id}/block`);

export const unblockUser = (id) => axiosInstance.patch(`/users/${id}/unblock`);
