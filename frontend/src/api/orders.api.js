/**
 * orders.api.js — API functions for BuyerOrder endpoints.
 * All calls use the shared Axios instance (auto-injects JWT).
 */
import api from './axios';

/**
 * BUYER: Place a new order for an inventory item.
 * @param {{ inventoryId: string, quantityKg: number }} data
 */
export const placeOrder = (data) =>
  api.post('/orders', data);

/**
 * BUYER: Get all orders belonging to the logged-in buyer.
 */
export const getMyOrders = () =>
  api.get('/orders/my');

/**
 * ADMIN: Get all orders across all buyers.
 */
export const getAllOrders = () =>
  api.get('/orders');

/**
 * ADMIN: Confirm a PLACED order.
 * @param {string} id — order ID
 */
export const confirmOrder = (id) =>
  api.patch(`/orders/${id}/confirm`);

/**
 * ADMIN: Mark a CONFIRMED order as DELIVERED.
 * @param {string} id — order ID
 */
export const deliverOrder = (id) =>
  api.patch(`/orders/${id}/deliver`);

/**
 * ADMIN: Cancel a PLACED order and release its reserved stock.
 * @param {string} id — order ID
 */
export const cancelOrder = (id) =>
  api.patch(`/orders/${id}/cancel`);
