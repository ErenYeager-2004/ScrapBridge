import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth.api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [clientError, setClientError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear client-side error when user edits
    if (clientError) setClientError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (form.newPassword !== form.confirmPassword) {
      setClientError('Passwords do not match.');
      return;
    }
    if (form.newPassword.length < 6) {
      setClientError('Password must be at least 6 characters.');
      return;
    }
    if (!token) {
      setError('Reset token is missing. Please use the link from your email.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await resetPassword(token, form.newPassword);
      setSuccess(true);
      // Navigate to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  // No token in URL at all
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-2xl rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-white font-semibold mb-2">Invalid Reset Link</p>
          <p className="text-gray-400 text-sm">No reset token found. Please use the link sent to your email.</p>
          <Link
            to="/forgot-password"
            id="rp-request-new"
            className="mt-6 w-full py-2.5 px-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors duration-200 block"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-2xl rounded-2xl p-8">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-600/20 border border-green-500/30 mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Password</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your new password below</p>
        </div>

        {success ? (
          /* Success state */
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-2">Password Reset!</p>
            <p className="text-gray-400 text-sm">
              Your password has been updated. Redirecting you to login…
            </p>
            <div className="mt-4 flex justify-center">
              <span className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Server-side error */}
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 bg-red-900/30 border border-red-500/40 rounded-lg text-red-300 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Client-side validation error */}
            {clientError && (
              <div className="flex items-start gap-2 px-4 py-3 bg-yellow-900/30 border border-yellow-500/40 rounded-lg text-yellow-300 text-sm">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {clientError}
              </div>
            )}

            <div>
              <label htmlFor="rp-newPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                New Password
              </label>
              <input
                id="rp-newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition"
              />
            </div>

            <div>
              <label htmlFor="rp-confirmPassword" className="block text-sm font-medium text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <input
                id="rp-confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your new password"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition"
              />
            </div>

            <button
              id="rp-submit"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting…
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <p className="text-center text-sm text-gray-400">
              <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
