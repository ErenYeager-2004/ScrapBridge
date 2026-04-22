/**
 * requests.api.js — API functions for the ScrapRequest lifecycle.
 * All calls use the shared Axios instance (auto-injects JWT).
 */
import api from './axios';

/**
 * Create a new scrap pickup request.
 * @param {FormData} formData — must include materialType, estimatedWeight, address (+ images)
 */
export const createRequest = (formData) =>
  api.post('/requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Get the logged-in HOME_USER's requests.
 * @param {object} filters — optional query params e.g. { status, page }
 */
export const getMyRequests = (filters = {}) =>
  api.get('/requests/my', { params: filters });

/**
 * ADMIN: get all requests.
 * @param {object} filters — optional query params e.g. { status, page }
 */
export const getAllRequests = (filters = {}) =>
  api.get('/requests', { params: filters });

/**
 * Get a single request by ID.
 * @param {string} id
 */
export const getRequestById = (id) =>
  api.get(`/requests/${id}`);

/**
 * ADMIN: set a quote on a PENDING request.
 * @param {string} id
 * @param {{ quotedPrice: number, collectorId: string }} data
 */
export const quoteRequest = (id, data) =>
  api.patch(`/requests/${id}/quote`, data);

/**
 * ADMIN: reject a request.
 * @param {string} id
 * @param {{ reason: string }} data
 */
export const rejectRequest = (id, data) =>
  api.patch(`/requests/${id}/reject`, data);

/**
 * HOME_USER: accept or reject a quote.
 * @param {string} id
 * @param {'accept'|'reject'} action
 */
export const respondToQuote = (id, action) =>
  api.patch(`/requests/${id}/respond`, { action });

/**
 * ADMIN: schedule a pickup date.
 * @param {string} id
 * @param {string} scheduledDate — ISO date string
 */
export const scheduleRequest = (id, scheduledDate) =>
  api.patch(`/requests/${id}/schedule`, { scheduledDate });

/**
 * COLLECTOR: mark a request as collected.
 * @param {string} id
 */
export const collectRequest = (id) =>
  api.patch(`/requests/${id}/collect`);

/**
 * COLLECTOR: get all pickups assigned to the current collector.
 * @param {object} filters — optional e.g. { status: 'SCHEDULED' }
 */
export const getAssignedPickups = (filters = {}) =>
  api.get('/requests/assigned', { params: filters });

/**
 * ADMIN/COLLECTOR: mark a request as completed (triggers inventory update).
 * @param {string} id
 */
export const completeRequest = (id) =>
  api.patch(`/requests/${id}/complete`);

/**
 * HOME_USER: download the PDF receipt for a completed request.
 * Fetches the PDF blob, creates a temporary object URL, and triggers
 * a browser "Save as…" download, then cleans up the temporary anchor.
 * @param {string} id
 * @returns {Promise<void>}
 */
export const downloadReceipt = async (id) => {
  const response = await api.get(`/requests/${id}/receipt`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ScrapBridge-Receipt.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
