import axiosInstance from './axiosInstance';

// Subscribe to restock notification
export const subscribeRestock = (productId) =>
  axiosInstance.post(`/products/${productId}/restock/subscribe`).then((r) => r.data);

// Unsubscribe from restock notification
export const unsubscribeRestock = (productId) =>
  axiosInstance.delete(`/products/${productId}/restock/subscribe`).then((r) => r.data);

// Get search suggestions/autocomplete
export const getSearchSuggestions = (q) =>
  axiosInstance.get(`/products/suggestions?q=${encodeURIComponent(q)}`).then((r) => r.data);

// Get trending searches
export const getTrendingSearches = () =>
  axiosInstance.get('/products/trending-searches').then((r) => r.data);

// Admin: set bulk pricing
export const setBulkPricing = (productId, bulkPricing) =>
  axiosInstance.put(`/products/${productId}/bulk-pricing`, { bulkPricing }).then((r) => r.data);
