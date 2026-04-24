import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAssignedPickups } from '../../api/requests.api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex items-center gap-4">
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

export default function CollectorDashboard() {
  const navigate = useNavigate();
  const fetchPickups = useCallback(() => getAssignedPickups(), []);
  const { data, loading } = useFetch(fetchPickups);
  const requests = data?.requests ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scheduled = requests.filter((r) => r.status === 'SCHEDULED');
  const completed = requests.filter((r) => r.status === 'COMPLETED');
  const collectedToday = requests.filter((r) => {
    if (r.status !== 'COLLECTED' && r.status !== 'COMPLETED') return false;
    const updated = new Date(r.updatedAt ?? r.createdAt);
    updated.setHours(0, 0, 0, 0);
    return updated.getTime() === today.getTime();
  });

  const todaysPickups = scheduled.filter((r) => {
    if (!r.scheduledDate) return false;
    const d = new Date(r.scheduledDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const upcomingPickups = scheduled
    .filter((r) => {
      if (!r.scheduledDate) return false;
      const d = new Date(r.scheduledDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() > today.getTime();
    })
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Collector Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your pickup schedule and stats.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={Truck}
          label="Assigned Pickups"
          value={loading ? '…' : scheduled.length}
          color="bg-violet-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Today"
          value={loading ? '…' : collectedToday.length}
          color="bg-blue-500"
        />
        <StatCard
          icon={Calendar}
          label="Total Completed"
          value={loading ? '…' : completed.length}
          color="bg-green-600"
        />
      </div>

      {/* Today's Pickups */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">Today's Pickups</h2>
          <button
            onClick={() => navigate('/collector/pickups')}
            className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading…
          </div>
        ) : todaysPickups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center text-sm text-gray-400">
            No pickups scheduled for today. 🎉
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todaysPickups.map((r) => (
              <div
                key={r.id}
                onClick={() => navigate(`/collector/pickups/${r.id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-green-200 dark:border-green-800/50 p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-green-400 dark:hover:border-green-600 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-gray-400">#{r.id.slice(0, 8)}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{r.user?.name ?? '—'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{r.pickupAddress}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {Array.isArray(r.items) && r.items.length > 0
                      ? r.items.map((i) => i.materialType).join(', ')
                      : '—'}
                  </p>
                  <span className="text-xs text-green-600 dark:text-green-400 group-hover:underline flex items-center gap-0.5">
                    Details <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Pickups */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">Upcoming Pickups</h2>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" />
              Loading…
            </div>
          ) : upcomingPickups.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No upcoming pickups scheduled.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {upcomingPickups.map((r) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/collector/pickups/${r.id}`)}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center">
                      <Calendar size={15} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{r.user?.name ?? '—'}</p>
                      <p className="text-xs text-gray-400 line-clamp-1">{r.pickupAddress}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatDate(r.scheduledDate)}
                    </p>
                    <StatusBadge status={r.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
