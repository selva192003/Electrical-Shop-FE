import axiosInstance from './axiosInstance.js';

export const getProducts = (params) => axiosInstance.get('/products', { params });

export const getFeaturedProducts = (limit = 8) => axiosInstance.get('/products/featured', { params: { limit } });

export const getProductById = (id) => axiosInstance.get(`/products/${id}`);

export const getCategories = () => axiosInstance.get('/products/categories');

export const getBrands = () => axiosInstance.get('/products/brands');

export const getRelatedProducts = (id) => axiosInstance.get(`/products/${id}/related`);

export const getProductsByCategory = (slug, params) =>
  axiosInstance.get(`/products/by-category/${slug}`, { params });

export const createProduct = (formData) =>
  axiosInstance.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateProduct = (id, data) => axiosInstance.put(`/products/${id}`, data);

export const deleteProduct = (id) => axiosInstance.delete(`/products/${id}`);
