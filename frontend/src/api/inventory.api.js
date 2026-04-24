/**
 * API functions for Inventory management.
 * All calls use the shared Axios instance with automatic JWT injection.
 */
import api from './axios';

/**
 * Fetches available inventory items.
 * @param {object} filters - { materialType, minWeight, maxPrice }
 */
export const getInventory = (filters = {}) =>
  api.get('/inventory', { params: filters });

/**
 * Fetches all inventory records, including unavailable ones (Admin only).
 */
export const getAllInventory = () =>
  api.get('/inventory/all');
