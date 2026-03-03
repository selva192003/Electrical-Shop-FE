import axiosInstance from './axiosInstance';

// Get all warranties for logged-in user
export const getMyWarranties = () =>
  axiosInstance.get('/warranties/my').then((r) => r.data);

// File a warranty claim
export const fileWarrantyClaim = (warrantyId, claimDetails) =>
  axiosInstance.post(`/warranties/claim/${warrantyId}`, { claimDetails }).then((r) => r.data);

// Admin: get all warranties
export const getAllWarranties = (status = '') =>
  axiosInstance.get(`/warranties/admin/all${status ? `?status=${status}` : ''}`).then((r) => r.data);
