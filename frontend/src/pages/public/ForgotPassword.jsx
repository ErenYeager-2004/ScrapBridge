import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth.api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
    } catch {
      // Swallow errors — always show the safe message
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-2xl rounded-2xl p-8">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-600/20 border border-green-500/30 mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          /* Success state */
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-9 h-9 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-2">Check your inbox</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              If an account exists with this email, a password reset link has been sent. Check your spam folder if you don't see it.
            </p>
            <Link
              to="/login"
              id="fp-back-login"
              className="mt-6 w-full py-2.5 px-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors duration-200 block text-center"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fp-email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email address
              </label>
              <input
                id="fp-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition"
              />
            </div>

            <button
              id="fp-submit"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending…
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>

            <p className="text-center text-sm text-gray-400">
              Remembered it?{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
