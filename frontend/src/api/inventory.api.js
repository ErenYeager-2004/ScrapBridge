/**
 * inventory.api.js — API functions for Inventory endpoints.
 * All calls use the shared Axios instance (auto-injects JWT).
 */
import api from './axios';

/**
 * Get available inventory items (BUYER / ADMIN).
 * @param {object} filters — optional: { materialType, minWeight, maxPrice }
 */
export const getInventory = (filters = {}) =>
  api.get('/inventory', { params: filters });

/**
 * ADMIN: Get ALL inventory records regardless of availability.
 */
export const getAllInventory = () =>
  api.get('/inventory/all');
