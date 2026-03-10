import axiosInstance from './axiosInstance.js';

export const submitReview = (productId, data) =>
  axiosInstance.post(`/reviews/${productId}`, data);

export const editReview = (reviewId, data) =>
  axiosInstance.put(`/reviews/${reviewId}`, data);

export const getMyReview = (productId) =>
  axiosInstance.get(`/reviews/product/${productId}/my`);

export const getProductReviews = (productId) =>
  axiosInstance.get(`/reviews/product/${productId}`);

export const checkReviewEligibility = (productId) =>
  axiosInstance.get(`/reviews/product/${productId}/eligibility`);

export const voteReview = (reviewId, vote) =>
  axiosInstance.post(`/reviews/${reviewId}/vote`, { vote });
