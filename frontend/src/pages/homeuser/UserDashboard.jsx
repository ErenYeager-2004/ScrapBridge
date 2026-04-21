import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  AlertTriangle,
  Plus,
  Eye,
  TrendingUp,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { getMyRequests } from '../../api/requests.api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency, formatWeight } from '../../utils/formatters';

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

function summariseItems(items = []) {
  if (!items || items.length === 0) return '—';
  const first = MATERIAL_LABELS[items[0]?.materialType] ?? items[0]?.materialType;
  const rest  = items.length - 1;
  return rest > 0 ? `${first} +${rest}` : first;
}

const ACTIVE_STATUSES = ['PENDING', 'QUOTED', 'SCHEDULED', 'COLLECTED'];

export default function UserDashboard() {
  const navigate = useNavigate();

  const { data, loading } = useFetch(getMyRequests);
  const requests = data?.requests ?? data ?? [];

  /* ── derived stats ───────────────────── */
  const total       = requests.length;
  const activePending = requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length;
  const totalEarnings = requests
    .filter((r) => r.status === 'COMPLETED' && r.quotedPrice)
    .reduce((acc, r) => acc + Number(r.quotedPrice), 0);

  const quotedRequests = requests.filter((r) => r.status === 'QUOTED');
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  /* ─── stat cards config ──────────────── */
  const STAT_CARDS = [
    {
      label:    'Total Requests',
      value:    total,
      Icon:     ClipboardList,
      color:    'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
      iconBg:   'bg-blue-100 dark:bg-blue-800/40',
    },
    {
      label:    'Active / Pending',
      value:    activePending,
      Icon:     Activity,
      color:    'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
      iconBg:   'bg-amber-100 dark:bg-amber-800/40',
    },
    {
      label:    'Total Earnings',
      value:    formatCurrency(totalEarnings),
      Icon:     TrendingUp,
      color:    'bg-green-50 dark:bg-green-900/20 text-green-700',
      iconBg:   'bg-green-100 dark:bg-green-800/40',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Overview of your pickup requests and earnings.
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STAT_CARDS.map(({ label, value, Icon, color, iconBg }) => (
            <div
              key={label}
              className={`rounded-2xl p-5 flex items-center gap-4 ${color} border border-transparent`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
                <p className="text-2xl font-bold mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pending Action Alert ── */}
      {!loading && quotedRequests.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle size={18} />
            <h2 className="font-semibold text-sm">Pending Action Required</h2>
          </div>
          <div className="space-y-2">
            {quotedRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-amber-100 dark:border-amber-800 gap-3 flex-wrap"
              >
                <div>
                  <span className="text-xs font-mono text-gray-500">
                    #{req.id.slice(0, 8).toUpperCase()}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white mt-0.5">
                    Quote:{' '}
                    <span className="text-green-600">{formatCurrency(req.quotedPrice)}</span>
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/user/requests/${req.id}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  View &amp; Respond
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Action ── */}
      <div>
        <button
          onClick={() => navigate('/user/new-request')}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-base font-semibold transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
        >
          <Plus size={20} />
          Submit New Pickup Request
        </button>
      </div>

      {/* ── Recent Requests ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Recent Requests
          </h2>
          <button
            onClick={() => navigate('/user/requests')}
            className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
          >
            View all →
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && recentRequests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <ClipboardList size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                No requests yet. Submit your first pickup request!
              </p>
              <button
                onClick={() => navigate('/user/new-request')}
                className="mt-1 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Submit New Request
              </button>
            </div>
          )}

          {!loading && recentRequests.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Materials
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
                {recentRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                      #{req.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 dark:text-gray-200">
                      {summariseItems(req.items)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/user/requests/${req.id}`)}
                        className="flex items-center gap-1.5 ml-auto px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-200 hover:text-green-700 rounded-lg transition-colors"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && recentRequests.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Showing {recentRequests.length} most recent request
                {recentRequests.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
