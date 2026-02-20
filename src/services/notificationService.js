import axiosInstance from './axiosInstance.js';

export const getNotifications = (params) => axiosInstance.get('/notifications', { params });

export const getUnreadCount = () => axiosInstance.get('/notifications/unread-count');

export const markAsRead = (id) => axiosInstance.patch(`/notifications/${id}/read`);

export const markAllAsRead = () => axiosInstance.patch('/notifications/mark-all-read');

export const deleteNotification = (id) => axiosInstance.delete(`/notifications/${id}`);

export const clearNotifications = () => axiosInstance.delete('/notifications');
