import api from './axios';

/**
 * Login a user with email and password.
 * @param {string} email
 * @param {string} password
 */
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

/**
 * Register a new user.
 * @param {object} data - { name, email, password, role? }
 */
export const register = (data) =>
  api.post('/auth/register', data);

/**
 * Fetch the currently authenticated user's profile.
 */
export const getMe = () =>
  api.get('/auth/me');

/**
 * Send a forgot-password email.
 * @param {string} email
 */
export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email });

/**
 * Reset password using the reset token.
 * @param {string} token
 * @param {string} newPassword
 */
export const resetPassword = (token, newPassword) =>
  api.post('/auth/reset-password', { token, newPassword });
