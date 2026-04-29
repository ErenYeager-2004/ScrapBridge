import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register as registerApi } from '../../api/auth.api';

const ROLE_OPTIONS = [
  { value: 'HOME_USER', label: 'Home User' },
  { value: 'BUYER', label: 'Buyer' },
];

// ── Sub-component: shown after successful registration ──────────────────────
function CheckInboxScreen({ email }) {
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  // Listen for EMAIL_VERIFIED broadcast from the VerifyEmail tab
  useEffect(() => {
    const channel = new BroadcastChannel('scrapbridge-auth');
    channel.onmessage = (e) => {
      if (e.data?.type === 'EMAIL_VERIFIED') setVerified(true);
    };
    return () => channel.close();
  }, []);

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-2xl rounded-2xl p-8 text-center">
          {/* Check icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 mb-6 mx-auto">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
          <p className="text-gray-400 text-sm mb-6">
            Your account is now active. You can sign in below.
          </p>

          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-2xl rounded-2xl p-8 text-center">
        {/* Envelope icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600/20 border border-green-500/30 mb-6 mx-auto">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Check your inbox!</h2>
        <p className="text-gray-400 text-sm mb-4">We've sent a verification link to</p>
        <p className="text-green-400 font-semibold text-base mb-6 bg-green-900/30 border border-green-700/40 rounded-lg px-4 py-2 break-all">
          {email}
        </p>

        <div className="bg-yellow-900/30 border border-yellow-600/40 rounded-lg px-4 py-3 text-yellow-300 text-sm text-left mb-6">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>
              <strong>Important:</strong> You must verify your email before you can log in.
              The link expires in <strong>24 hours</strong>. Check your spam folder if you don't see it.
            </span>
          </div>
        </div>

        {/* Waiting indicator */}
        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Waiting for verification…
        </div>
      </div>
    </div>
  );
}

// ── Main Register component ─────────────────────────────────────────────────
export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'HOME_USER',
  });
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.phone) delete payload.phone;
      await registerApi(payload);
      setRegisteredEmail(form.email);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Show check-inbox screen (with live broadcast listener) after registration
  if (registeredEmail) {
    return <CheckInboxScreen email={registeredEmail} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-2xl rounded-2xl p-8">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-600/20 border border-green-500/30 mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ScrapBridge</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-1.5">
              Email address
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Min 8 characters"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">
              Phone <span className="text-gray-500">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1.5">
              I am a…
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:text-green-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
