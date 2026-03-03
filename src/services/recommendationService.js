import axiosInstance from './axiosInstance';

// Get personalized recommendations
export const getRecommendations = (limit = 8) =>
  axiosInstance.get(`/recommendations/for-you?limit=${limit}`).then((r) => r.data);

// Get trending products
export const getTrendingProducts = (limit = 8) =>
  axiosInstance.get(`/recommendations/trending?limit=${limit}`).then((r) => r.data);

// Get frequently bought together
export const getFrequentlyBoughtTogether = (productId) =>
  axiosInstance.get(`/recommendations/frequently-bought-together/${productId}`).then((r) => r.data);

// Get recently viewed
export const getRecentlyViewed = (limit = 10) =>
  axiosInstance.get(`/recommendations/recently-viewed?limit=${limit}`).then((r) => r.data);

// Track product view
export const trackProductView = (productId) =>
  axiosInstance.post(`/recommendations/track/${productId}`).catch(() => {});
