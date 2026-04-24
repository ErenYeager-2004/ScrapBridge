/**
 * API functions for the Admin module.
 * All calls use the shared Axios instance with automatic JWT injection.
 */
import api from './axios';

/**
 * GET /api/admin/stats
 * Returns the full analytics payload for the admin dashboard.
 * Shape: { userCounts, activeRequestsCount, pendingOrdersCount, totalRevenue,
 *          weeklyRequestCounts, materialDistribution, monthlyRevenue,
 *          averageRating, totalFeedbackCount }
 */
export const getDashboardStats = () => api.get('/admin/stats');

/**
 * GET /api/admin/export/requests
 * Returns a CSV blob of all scrap requests.
 */
export const exportRequestsCSV = () =>
  api.get('/admin/export/requests', { responseType: 'blob' });

/**
 * GET /api/admin/export/inventory
 * Returns a CSV blob of the full inventory.
 */
export const exportInventoryCSV = () =>
  api.get('/admin/export/inventory', { responseType: 'blob' });

/**
 * GET /api/admin/users
 * params: { role, search, sortBy, order } — all optional
 */
export const getAllUsers = (params = {}) =>
  api.get('/admin/users', { params });

/**
 * GET /api/admin/users/:id
 */
export const getUserById = (id) =>
  api.get(`/admin/users/${id}`);

/**
 * POST /api/admin/users
 * data: { name, email, password, phone, role }
 */
export const createUser = (data) =>
  api.post('/admin/users', data);

/**
 * PUT /api/admin/users/:id
 * data: { name, phone }
 */
export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

/**
 * DELETE /api/admin/users/:id
 */
export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);
