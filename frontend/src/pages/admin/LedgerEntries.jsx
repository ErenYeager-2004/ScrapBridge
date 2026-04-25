import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAllRequests } from '../../api/requests.api';
import { formatCurrency, getRelativeTime, formatDate } from '../../utils/formatters';

function formatMaterialLabel(type = '') {
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`}
    />
  );
}

export default function LedgerEntries() {
  const navigate = useNavigate();

  const { data: reqData, loading: reqLoading } = useFetch(
    () => getAllRequests(),
    []
  );

  const allRequests = reqData?.requests ?? [];
  const completedRequests = [...allRequests]
    .filter((r) => r.status === 'COMPLETED')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ledger Entries
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Record of all completed transactions and payouts.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
              Transaction History
            </h3>
          </div>
        </div>

        {reqLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : completedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardList size={48} className="mb-4 opacity-40" />
            <p className="text-lg font-medium">No completed requests yet.</p>
            <p className="text-sm mt-1">Once pickups are completed, they will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-gray-700/60">
            {completedRequests.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => navigate(`/admin/requests/${r.id}`)}
                  className="w-full flex items-center gap-5 px-6 py-4 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors text-left group"
                >
                  {/* Green pulse dot */}
                  <span className="relative flex h-3 w-3 flex-shrink-0">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-medium text-gray-900 dark:text-white truncate">
                        {r.user?.name ?? 'Unknown'}
                      </p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400 flex-shrink-0 ml-2">
                        {r.adminPrice ? formatCurrency(r.adminPrice) : '—'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        {Array.isArray(r.items) && r.items.length > 0
                          ? r.items.map((i) => formatMaterialLabel(i.materialType)).join(', ')
                          : 'Completed pickup'}
                      </p>
                      <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatDate(r.updatedAt)} ({getRelativeTime(r.updatedAt)})
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
