/**
 * API functions for Buyer Order management.
 * All calls use the shared Axios instance with automatic JWT injection.
 */
import api from './axios';

/**
 * Places a new order for an inventory item.
 * @param {{ inventoryId: string, quantityKg: number }} data
 */
export const placeOrder = (data) =>
  api.post('/orders', data);

/**
 * Fetches all orders belonging to the authenticated buyer.
 */
export const getMyOrders = () =>
  api.get('/orders/my');

/**
 * Fetches all orders across the platform (Admin only).
 */
export const getAllOrders = () =>
  api.get('/orders');

/**
 * Confirms a pending order (Admin only).
 * @param {string} id - The order ID
 */
export const confirmOrder = (id) =>
  api.patch(`/orders/${id}/confirm`);

/**
 * Marks a confirmed order as delivered (Admin only).
 * @param {string} id - The order ID
 */
export const deliverOrder = (id) =>
  api.patch(`/orders/${id}/deliver`);

/**
 * Cancels a placed order and releases reserved stock (Admin only).
 * @param {string} id - The order ID
 */
export const cancelOrder = (id) =>
  api.patch(`/orders/${id}/cancel`);
