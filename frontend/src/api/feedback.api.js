import api from './axios';

/**
 * submitFeedback — POST /api/feedback
 * Body: { requestId, rating (1-5), comment? }
 * NOTE: pre-unwraps response because it is called directly (not via useFetch).
 */
export const submitFeedback = (data) => api.post('/feedback', data).then((r) => r.data);

/**
 * getAllFeedback — GET /api/feedback  (ADMIN only)
 * Returns raw Axios promise so useFetch can do its own .then(res => res.data) unwrap.
 */
export const getAllFeedback = () => api.get('/feedback');
