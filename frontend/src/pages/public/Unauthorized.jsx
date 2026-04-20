import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-green-500 text-sm font-semibold uppercase tracking-widest mb-3">Error 403</p>
        <h1 className="text-5xl font-extrabold text-white mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-8">You don&apos;t have permission to view this page.</p>
        <Link
          to="/"
          id="unauthorized-home"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-colors"
        >
          ← Go Home
        </Link>
      </div>
    </div>
  );
}
