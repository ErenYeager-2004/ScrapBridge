/**
 * API functions for managing the ScrapRequest lifecycle.
 * All calls use the shared Axios instance with automatic JWT injection.
 */
import api from './axios';

/**
 * Creates a new scrap pickup request.
 * @param {FormData} formData - includes materialType, estimatedWeight, address, and photos.
 */
export const createRequest = (formData) =>
  api.post('/requests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * Fetches requests for the authenticated user.
 * @param {object} filters - Optional query parameters (status, page, etc.)
 */
export const getMyRequests = (filters = {}) =>
  api.get('/requests/my', { params: filters });

/**
 * Fetches all requests across the platform (Admin only).
 * @param {object} filters - Optional query parameters (status, page, etc.)
 */
export const getAllRequests = (filters = {}) =>
  api.get('/requests', { params: filters });

/**
 * Fetches a single scrap request by its ID.
 * @param {string} id
 */
export const getRequestById = (id) =>
  api.get(`/requests/${id}`);

/**
 * Sets a price quote with a proposed pickup date for a pending request (Admin only).
 * @param {string} id
 * @param {{ adminPrice: number, adminNotes?: string, proposedDate: string }} data
 */
export const quoteRequest = (id, data) =>
  api.patch(`/requests/${id}/quote`, data);

/**
 * Rejects a scrap request (Admin only).
 * @param {string} id
 * @param {{ reason: string }} data
 */
export const rejectRequest = (id, data) =>
  api.patch(`/requests/${id}/reject`, data);

/**
 * Accepts or rejects a price quote (Home User only).
 * @param {string} id
 * @param {'accept'|'reject'} action
 */
export const respondToQuote = (id, action) =>
  api.patch(`/requests/${id}/respond`, { action });

// scheduleRequest renamed to schedulePickup — update all callers.
/**
 * Assigns a collector and finalises scheduling for an ACCEPTED request (Admin only).
 * @param {string} id
 * @param {{ collectorId: string, scheduledDate?: string }} data
 */
export const schedulePickup = (id, data) =>
  api.patch(`/requests/${id}/schedule`, data);

/**
 * Marks a request as collected (Collector only).
 * @param {string} id
 */
export const collectRequest = (id) =>
  api.patch(`/requests/${id}/collect`);

/**
 * Fetches all pickups assigned to the authenticated collector.
 * @param {object} filters - Optional query parameters.
 */
export const getAssignedPickups = (filters = {}) =>
  api.get('/requests/assigned', { params: filters });

/**
 * Marks a request as fully completed (Admin/Collector only).
 * @param {string} id
 */
export const completeRequest = (id) =>
  api.patch(`/requests/${id}/complete`);

/**
 * Downloads the PDF receipt for a completed request.
 * @param {string} id
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
