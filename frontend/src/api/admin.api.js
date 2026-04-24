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
