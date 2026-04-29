import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../../api/auth.api';


function getInitialStatus(searchParams) {
  if (searchParams.get('success') === 'true') return 'success';
  if (searchParams.get('token')) return 'loading'; // token present → will verify
  return 'idle'; // no token, no success → show "check inbox"
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();

  // Lazy initializer: status is correct on the very first render, no effect needed.
  const [status, setStatus] = useState(() => getInitialStatus(searchParams));
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    verifyEmail(token)
      .then(() => {
        // Notify the Register tab (or any other tab listening) that verification succeeded
        const channel = new BroadcastChannel('scrapbridge-auth');
        channel.postMessage({ type: 'EMAIL_VERIFIED' });
        channel.close();
        setStatus('success');
      })
      .catch((err) => {
        setErrorMsg(
          err?.response?.data?.message ?? 'Invalid or expired verification link.'
        );
        setStatus('error');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-green-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 shadow-2xl rounded-2xl p-8 text-center">
        {/* Brand */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-green-600/20 border border-green-500/30 mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-6">Email Verification</h1>

        {/* Loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <span className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Verifying your email address…</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center">
              <svg className="w-9 h-9 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Email Verified!</p>
              <p className="text-gray-400 text-sm mt-1">
                Your account is active. You can close this tab and sign in from the other tab,
                or click below.
              </p>
            </div>
            <Link
              to="/login"
              id="verify-go-login"
              className="mt-2 w-full py-2.5 px-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors duration-200 block"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center">
              <svg className="w-9 h-9 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">Verification Failed</p>
              <p className="text-gray-400 text-sm mt-1">{errorMsg}</p>
            </div>
            <Link
              to="/login"
              id="verify-back-login"
              className="mt-2 w-full py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 block"
            >
              Back to Login
            </Link>
          </div>
        )}

        {/* Idle (no token, no success) */}
        {status === 'idle' && (
          <div className="flex flex-col items-center gap-4">
            <div className="text-5xl">✉️</div>
            <div>
              <p className="text-lg font-semibold text-white">Check Your Inbox</p>
              <p className="text-gray-400 text-sm mt-1">
                A verification link has been sent to your email address. Click it to verify your account.
              </p>
            </div>
            <Link
              to="/login"
              id="verify-idle-login"
              className="mt-2 w-full py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 block"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
