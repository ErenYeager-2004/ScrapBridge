import api from './axios';

/**
 * submitFeedback — POST /api/feedback
 * @param {object} data - { requestId, rating (1-5), comment? }
 */
export const submitFeedback = (data) => api.post('/feedback', data).then((r) => r.data);

/**
 * getAllFeedback — GET /api/feedback (ADMIN only)
 */
export const getAllFeedback = () => api.get('/feedback');
