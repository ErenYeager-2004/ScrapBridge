import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, CheckCircle2, Calendar, Loader } from "lucide-react";
import toast from "react-hot-toast";
import useFetch from "../../hooks/useFetch";
import { getAssignedPickups, collectRequest } from "../../api/requests.api";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmModal from "../../components/common/ConfirmModal";
import { formatDate } from "../../utils/formatters";

export default function CollectorDashboard() {
  const navigate = useNavigate();
  const fetchPickups = useCallback(() => getAssignedPickups(), []);
  const { data, loading, refetch } = useFetch(fetchPickups);
  const requests = data?.requests ?? [];

  const [collectModal, setCollectModal] = useState({
    isOpen: false,
    requestId: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const scheduled = requests.filter((r) => r.status === "SCHEDULED");
  const completed = requests.filter((r) => r.status === "COMPLETED");

  const todaysRouteTotal = requests.filter((r) => {
    if (!r.scheduledDate) return false;
    const d = new Date(r.scheduledDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const completedTodayRoute = todaysRouteTotal.filter(
    (r) => r.status === "COLLECTED" || r.status === "COMPLETED",
  );

  const todaysPickups = todaysRouteTotal.filter(
    (r) => r.status === "SCHEDULED",
  );

  const upcomingPickups = scheduled
    .filter((r) => {
      if (!r.scheduledDate) return false;
      const d = new Date(r.scheduledDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() > today.getTime();
    })
    .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  const handleCollect = async () => {
    const { requestId } = collectModal;
    if (!requestId) return;
    setSubmitting(true);
    try {
      await collectRequest(requestId);
      toast.success("Pickup marked as collected!");
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? "Failed to mark as collected.");
    } finally {
      setSubmitting(false);
      setCollectModal({ isOpen: false, requestId: null });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Collector Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your route and pickups for today.
        </p>
      </div>

      {/* Top Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Today's Route Widget */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Today's Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-[1.5rem] p-6 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700/50">
              <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                {String(completedTodayRoute.length).padStart(2, "0")}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Completed
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-[1.5rem] p-6 flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700/50">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {String(todaysPickups.length).padStart(2, "0")}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Remaining
              </span>
            </div>
          </div>
        </div>

        {/* Total Completed Widget */}
        <div className="bg-green-600 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 size={20} className="text-white" />
            </div>
            <h2 className="text-base font-medium text-green-100">
              Total Completed
            </h2>
          </div>
          <div className="relative z-10 mt-6">
            <span className="text-5xl font-bold">{completed.length}</span>
            <p className="text-sm text-green-200 mt-1">All Time</p>
          </div>
        </div>
      </div>

      {/* Today's Pickups */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300">
            Today's Pickups
          </h2>
          <button
            onClick={() => navigate("/collector/pickups")}
            className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <Loader size={20} className="animate-spin mr-2" />
            Loading…
          </div>
        ) : todaysPickups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-200 dark:border-gray-700 p-8 text-center text-sm text-gray-400 shadow-sm">
            No pickups scheduled for today. 🎉
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todaysPickups.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-100 dark:border-gray-700">
                      <Truck
                        size={20}
                        className="text-green-600 dark:text-green-400"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {r.user?.name ?? "—"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 max-w-[200px] lg:max-w-xs">
                        {r.pickupAddress}
                      </p>

                      {/* Material Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {Array.isArray(r.items) && r.items.length > 0 ? (
                          r.items.slice(0, 2).map((i, idx) => (
                            <div key={idx} className="flex gap-1.5">
                              <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                                {i.materialType}
                              </span>
                              {i.estimatedWeight && (
                                <span className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
                                  {i.estimatedWeight} Kg
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                        {r.items && r.items.length > 2 && (
                          <span className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                            +{r.items.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {r.scheduledDate
                      ? new Date(r.scheduledDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <button
                    onClick={() =>
                      setCollectModal({ isOpen: true, requestId: r.id })
                    }
                    disabled={submitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-3 rounded-[1rem] transition-colors active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting && collectModal.requestId === r.id ? (
                      <Loader size={14} className="animate-spin" />
                    ) : null}
                    Mark Collected
                  </button>
                  <button
                    onClick={() => navigate(`/collector/pickups/${r.id}`)}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 dark:text-indigo-400 text-xs font-semibold py-3 rounded-[1rem] transition-colors active:scale-[0.98]"
                  >
                    View Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Pickups */}
      <section>
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Upcoming Pickups
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden p-2">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-400">
              <Loader size={20} className="animate-spin mr-2" />
              Loading…
            </div>
          ) : upcomingPickups.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              No upcoming pickups scheduled.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {upcomingPickups.map((r) => (
                <div
                  key={r.id}
                  onClick={() => navigate(`/collector/pickups/${r.id}`)}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center border border-purple-100 dark:border-purple-800/30">
                      <Calendar
                        size={16}
                        className="text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {r.user?.name ?? "—"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {r.pickupAddress}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap mb-1">
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

      {/* Confirm collect modal */}
      <ConfirmModal
        isOpen={collectModal.isOpen}
        title="Mark as Collected"
        message="Confirm that you have physically collected the scrap. This cannot be undone."
        onConfirm={handleCollect}
        onCancel={() => setCollectModal({ isOpen: false, requestId: null })}
      />
    </div>
  );
}
