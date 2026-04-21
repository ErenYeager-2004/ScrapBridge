import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Eye, Plus } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { getMyRequests } from '../../api/requests.api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatWeight } from '../../utils/formatters';

const MATERIAL_LABELS = {
  IRON_STEEL:      'Iron / Steel',
  COPPER:          'Copper',
  ALUMINIUM:       'Aluminium',
  BRASS:           'Brass',
  PLASTIC:         'Plastic',
  PAPER_CARDBOARD: 'Paper / Cardboard',
  GLASS:           'Glass',
  E_WASTE:         'E-Waste',
  RUBBER:          'Rubber',
  MIXED:           'Mixed / Other',
};

const STATUS_OPTIONS = ['ALL', 'PENDING', 'QUOTED', 'SCHEDULED', 'COLLECTED', 'COMPLETED', 'REJECTED'];

/** Summarises the items array: "Iron / Steel and 2 more" */
function summariseItems(items = []) {
  if (!items || items.length === 0) return '—';
  const first = MATERIAL_LABELS[items[0]?.materialType] ?? items[0]?.materialType;
  const rest  = items.length - 1;
  return rest > 0 ? `${first} and ${rest} more` : first;
}

export default function RequestHistory() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data, loading, error } = useFetch(getMyRequests);

  const requests = data?.requests ?? data ?? [];

  const filtered =
    statusFilter === 'ALL'
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Track all your scrap pickup requests in one place.
          </p>
        </div>
        <button
          onClick={() => navigate('/user/new-request')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-400 dark:text-gray-500 ml-auto">
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-16 text-red-500 text-sm">
            Failed to load requests. Please try refreshing.
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <ClipboardList size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {statusFilter === 'ALL'
                ? 'No requests yet. Submit your first pickup request!'
                : `No ${statusFilter.toLowerCase()} requests found.`}
            </p>
            {statusFilter === 'ALL' && (
              <button
                onClick={() => navigate('/user/new-request')}
                className="mt-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Submit New Request
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Materials
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Weight
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((req) => {
                const totalWeight = (req.items ?? []).reduce(
                  (acc, i) => acc + (i.estimatedWeight ?? 0),
                  0
                );
                return (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                      #{req.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 text-gray-700 dark:text-gray-200">
                      {summariseItems(req.items)}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-300">
                      {formatWeight(totalWeight)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => navigate(`/user/requests/${req.id}`)}
                        className="flex items-center gap-1.5 ml-auto px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-200 hover:text-green-700 dark:hover:text-green-400 rounded-lg transition-colors"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
