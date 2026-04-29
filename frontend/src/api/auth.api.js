import api from './axios';
import axios from 'axios';

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

/**
 * Verify email using the token from the verification link.
 * @param {string} token
 */
export const verifyEmail = (token) =>
  axios.get(`/api/auth/verify-email?token=${token}`);

/**
 * Update the authenticated user's profile (name and phone).
 * @param {{ name: string, phone?: string }} data
 */
export const updateProfile = (data) =>
  api.patch('/auth/profile', data);

/**
 * Change the authenticated user's password.
 * @param {{ currentPassword: string, newPassword: string }} data
 */
export const changePassword = (data) =>
  api.post('/auth/change-password', data);
