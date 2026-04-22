import { Star, MessageSquare, Users } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { getAllFeedback } from '../../api/feedback.api';
import StarRating from '../../components/common/StarRating';
import { formatDate } from '../../utils/formatters';

export default function FeedbackView() {
  const { data, loading, error } = useFetch(getAllFeedback, []);

  const averageRating = data?.averageRating ?? null;
  const totalCount    = data?.totalCount    ?? 0;
  const feedbackList  = data?.feedback      ?? [];

  /* ─── Rating colour helper ─────────────────────────────── */
  const ratingColour = (r) => {
    if (r >= 4) return 'text-emerald-600 dark:text-emerald-400';
    if (r >= 3) return 'text-amber-500  dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  /* ─── Render ───────────────────────────────────────────── */
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Star size={22} className="text-amber-400 fill-amber-400" />
          Customer Feedback
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Reviews submitted by home users after completed pickups.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Average rating */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Star size={22} className="text-amber-500 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Average Rating
            </p>
            {averageRating !== null ? (
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-base text-amber-400">★</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">No ratings yet</p>
            )}
          </div>
        </div>

        {/* Total reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <Users size={22} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Total Reviews
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-0.5">
              {totalCount}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
          <MessageSquare size={15} className="text-green-600" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
            All Feedback
          </h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="px-5 py-10 text-center text-red-500 text-sm">
            Failed to load feedback. Please refresh the page.
          </div>
        )}

        {!loading && !error && feedbackList.length === 0 && (
          <div className="px-5 py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
            No feedback has been submitted yet.
          </div>
        )}

        {!loading && feedbackList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Request ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Rating
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Comment
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {feedbackList.map((fb) => (
                  <tr
                    key={fb.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                  >
                    {/* User */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        {fb.user?.name ?? '—'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {fb.user?.email ?? ''}
                      </p>
                    </td>

                    {/* Request ID */}
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400 text-xs">
                      #{(fb.requestId ?? '').slice(0, 8).toUpperCase()}
                    </td>

                    {/* Rating — stars + numeric label */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StarRating value={fb.rating} readOnly />
                        <span className={`text-xs font-semibold ${ratingColour(fb.rating)}`}>
                          {fb.rating}/5
                        </span>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="px-4 py-3 max-w-xs">
                      {fb.comment ? (
                        <p className="text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                          "{fb.comment}"
                        </p>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(fb.createdAt)}
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
