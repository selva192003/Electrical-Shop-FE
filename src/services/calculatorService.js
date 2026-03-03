import axiosInstance from './axiosInstance';

/**
 * Sends the computed shopping list to the backend and gets real product matches.
 * @param {Array} items - [{ label, searchTerm, qty, unit, note }]
 */
export const matchCalculatorProducts = (items) =>
  axiosInstance.post('/calculator/match-products', { items }).then((r) => r.data);

/**
 * Bulk-adds a list of matched products to cart in ONE request.
 * @param {Array} items - [{ productId, quantity }]
 */
export const addCalculatorToCart = (items) =>
  axiosInstance.post('/calculator/add-to-cart', { items }).then((r) => r.data);

/**
 * Auto-creates a project with the full matched shopping list pre-populated.
 * @param {{ name, projectType, description, items: [{ productId, quantity, label }] }} payload
 */
export const saveCalculatorAsProject = (payload) =>
  axiosInstance.post('/calculator/save-as-project', payload).then((r) => r.data);
