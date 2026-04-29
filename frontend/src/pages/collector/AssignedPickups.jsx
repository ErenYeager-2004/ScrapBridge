import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Filter, Truck } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAssignedPickups } from '../../api/requests.api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

const STATUS_OPTIONS = ['', 'SCHEDULED', 'COLLECTED'];

export default function AssignedPickups() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPickups = useCallback(() => getAssignedPickups(), []);
  const { data, loading, error } = useFetch(fetchPickups);
  
  const requests = useMemo(() => {
    return (data?.requests ?? []).filter(r => r.status === 'SCHEDULED' || r.status === 'COLLECTED');
  }, [data]);

  const filtered = useMemo(() => {
    if (!statusFilter) return requests;
    return requests.filter((r) => r.status === statusFilter);
  }, [requests, statusFilter]);

  const summariseMaterials = (items) => {
    if (!Array.isArray(items) || items.length === 0) return '—';
    const types = [...new Set(items.map((i) => i.materialType))];
    return types.join(', ');
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Assigned Pickups</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          All scrap pickups assigned to you.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm flex items-end gap-4 flex-wrap">
        <div className="flex flex-col gap-1 min-w-[180px]">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Filter size={12} /> Filter by Status
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
        {statusFilter && (
          <button
            onClick={() => setStatusFilter('')}
            className="text-sm text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-3" />
            Loading pickups…
          </div>
        )}

        {error && (
          <div className="py-12 text-center text-red-500 text-sm">Failed to load pickups.</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {['Request ID', 'User', 'Address', 'Materials', 'Scheduled Date', 'Status', 'Action'].map((h) => (
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
                        <Truck size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-sm font-medium">No pickups assigned to you yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">
                        #{r.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                        {r.user?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[180px] truncate">
                        {r.pickupAddress}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {summariseMaterials(r.items)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {r.scheduledDate ? formatDate(r.scheduledDate) : <span className="italic text-gray-400">TBD</span>}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          id={`view-pickup-${r.id}`}
                          onClick={() => navigate(`/collector/pickups/${r.id}`)}
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

        {!loading && !error && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
            Showing {filtered.length} of {requests.length} active pickups
          </div>
        )}
      </div>
    </div>
  );
}
