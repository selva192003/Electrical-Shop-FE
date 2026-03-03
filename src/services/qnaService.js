import axiosInstance from './axiosInstance';

// Get all Q&A for a product
export const getProductQnA = (productId, page = 1, limit = 10) =>
  axiosInstance.get(`/qna/${productId}?page=${page}&limit=${limit}`).then((r) => r.data);

// Ask a question
export const askQuestion = (productId, question) =>
  axiosInstance.post(`/qna/${productId}/ask`, { question }).then((r) => r.data);

// Answer a question
export const answerQuestion = (qnaId, answer) =>
  axiosInstance.post(`/qna/answer/${qnaId}`, { answer }).then((r) => r.data);

// Upvote a question
export const upvoteQuestion = (qnaId) =>
  axiosInstance.post(`/qna/upvote/${qnaId}`).then((r) => r.data);

// Delete a question
export const deleteQuestion = (qnaId) =>
  axiosInstance.delete(`/qna/${qnaId}`).then((r) => r.data);
