import axiosInstance from './axiosInstance';

// Get all projects for logged-in user
export const getMyProjects = () =>
  axiosInstance.get('/projects').then((r) => r.data);

// Get a single project
export const getProject = (id, token = null) =>
  axiosInstance.get(`/projects/${id}${token ? `?token=${token}` : ''}`).then((r) => r.data);

// Create a project
export const createProject = (data) =>
  axiosInstance.post('/projects', data).then((r) => r.data);

// Update project metadata
export const updateProject = (id, data) =>
  axiosInstance.put(`/projects/${id}`, data).then((r) => r.data);

// Delete a project
export const deleteProject = (id) =>
  axiosInstance.delete(`/projects/${id}`).then((r) => r.data);

// Add item to project
export const addItemToProject = (projectId, productId, quantity = 1, notes = '') =>
  axiosInstance.post(`/projects/${projectId}/items`, { productId, quantity, notes }).then((r) => r.data);

// Update project item
export const updateProjectItem = (projectId, itemId, data) =>
  axiosInstance.put(`/projects/${projectId}/items/${itemId}`, data).then((r) => r.data);

// Remove item from project
export const removeItemFromProject = (projectId, itemId) =>
  axiosInstance.delete(`/projects/${projectId}/items/${itemId}`).then((r) => r.data);

// Toggle share link
export const toggleShare = (projectId) =>
  axiosInstance.post(`/projects/${projectId}/share`).then((r) => r.data);

// Add all project items to cart
export const addProjectToCart = (projectId) =>
  axiosInstance.post(`/projects/${projectId}/add-to-cart`).then((r) => r.data);
