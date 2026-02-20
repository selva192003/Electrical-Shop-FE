import axiosInstance from './axiosInstance.js';

export const createTicket = (data) => axiosInstance.post('/support', data);

export const getMyTickets = () => axiosInstance.get('/support');

export const getTicket = (id) => axiosInstance.get(`/support/${id}`);

export const replyToTicket = (id, data) => axiosInstance.post(`/support/${id}/reply`, data);

// Admin
export const getAllTickets = (params) => axiosInstance.get('/support/admin/all', { params });

export const updateTicketStatus = (id, status) =>
  axiosInstance.patch(`/support/${id}/status`, { status });
