import { useNavigate } from 'react-router-dom';
import { Users, ClipboardList, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAllRequests } from '../../api/requests.api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  /* ── fetch all requests to derive stats ── */
  const { data, loading } = useFetch(() => getAllRequests(), []);
  const requests = data?.requests ?? [];

  const totalUsers = '—'; // Phase 7: replace with dedicated admin stats endpoint
  const activeRequests = requests.filter((r) =>
    ['PENDING', 'QUOTED', 'SCHEDULED', 'COLLECTED'].includes(r.status)
  ).length;
  const pendingOrders = requests.filter((r) => r.status === 'PENDING').length;
  const totalRevenue = requests
    .filter((r) => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + parseFloat(r.adminPrice || 0), 0);

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Overview of ScrapBridge operations.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={totalUsers} color="bg-blue-500" />
        <StatCard icon={ClipboardList} label="Active Requests" value={loading ? '…' : activeRequests} color="bg-violet-500" />
        <StatCard icon={Clock} label="Pending Orders" value={loading ? '…' : pendingOrders} color="bg-amber-500" />
        <StatCard icon={TrendingUp} label="Total Revenue" value={loading ? '…' : formatCurrency(totalRevenue)} color="bg-green-600" />
      </div>

      {/* Recent requests */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Requests</h2>
          <button
            onClick={() => navigate('/admin/requests')}
            className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  {['ID', 'User', 'Materials', 'Status', 'Date', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No requests yet.</td>
                  </tr>
                ) : recentRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">#{r.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">{r.user?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {Array.isArray(r.items) && r.items.length > 0 ? r.items[0].materialType : '—'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/admin/requests/${r.id}`)}
                        className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                      >
                        View <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
