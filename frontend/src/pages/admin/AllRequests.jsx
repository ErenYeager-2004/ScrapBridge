import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Eye, ClipboardList } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAllRequests } from '../../api/requests.api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = ['', 'PENDING', 'QUOTED', 'SCHEDULED', 'COLLECTED', 'COMPLETED', 'REJECTED'];

export default function AllRequests() {
  const navigate = useNavigate();

  /* ── local filter state ── */
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  /* ── fetch all requests (no query params — we filter client-side for search) ── */
  const fetchRequests = useCallback(() => getAllRequests(), []);
  const { data, loading, error } = useFetch(fetchRequests);
  const requests = data?.requests ?? [];

  /* ── client-side filtering ── */
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (dateFrom && new Date(r.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(r.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
      if (search) {
        const q = search.toLowerCase();
        const userName = r.user?.name?.toLowerCase() ?? '';
        const reqId = r.id?.toLowerCase() ?? '';
        if (!userName.includes(q) && !reqId.includes(q)) return false;
      }
      return true;
    });
  }, [requests, statusFilter, dateFrom, dateTo, search]);

  /* ── helpers ── */
  const summariseMaterials = (items) => {
    if (!Array.isArray(items) || items.length === 0) return '—';
    if (items.length === 1) return items[0].materialType;
    return `${items[0].materialType} +${items.length - 1} more`;
  };

  return (
    <div className="p-6 lg:p-8 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage and review every scrap pickup request.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Status */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Filter size={12} /> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || 'All Statuses'}</option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or request ID…"
              className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Clear */}
          {(statusFilter || dateFrom || dateTo || search) && (
            <button
              onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setSearch(''); }}
              className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-3" />
            Loading requests…
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-red-500 text-sm">
            Failed to load requests. Please try again.
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {['Request ID', 'User Name', 'Materials', 'Status', 'Assigned Collector', 'Date Submitted', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <ClipboardList size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-sm font-medium">No requests in the system yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">
                        #{r.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                        {r.user?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {summariseMaterials(r.items)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {r.collector?.name ?? <span className="text-gray-400 italic">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          id={`view-request-${r.id}`}
                          onClick={() => navigate(`/admin/requests/${r.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                        >
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && !error && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
            Showing {filtered.length} of {requests.length} requests
          </div>
        )}
      </div>
    </div>
  );
}
