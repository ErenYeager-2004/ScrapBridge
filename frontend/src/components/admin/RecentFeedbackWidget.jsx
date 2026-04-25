import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Headphones } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAllFeedback } from '../../api/feedback.api';

function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${className}`}
    />
  );
}

export default function RecentFeedbackWidget() {
  const navigate = useNavigate();
  const { data, loading } = useFetch(getAllFeedback, []);

  const feedbackList = data?.feedback || [];
  // Take only the top 3 most recent feedbacks
  const recentFeedback = [...feedbackList]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className="bg-[#f4f7fc] dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative flex flex-col h-full">
      {/* Floating Action Button */}
      <button className="absolute -top-4 -right-4 bg-[#0f8c5b] hover:bg-[#0c7249] text-white p-3.5 rounded-full shadow-lg transition-colors z-10">
        <Headphones size={24} />
      </button>

      <div className="px-6 py-5">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Recent Feedback
        </h3>

        <div className="space-y-4 flex-1">
          {loading ? (
            <>
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </>
          ) : recentFeedback.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Star size={32} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">No feedback yet.</p>
            </div>
          ) : (
            recentFeedback.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2.5">
                    {/* Avatar placeholder */}
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {item.user?.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {item.user?.name || 'Unknown User'}
                    </span>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < item.rating ? 'fill-[#0f8c5b] text-[#0f8c5b]' : 'fill-gray-200 text-gray-200'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[13px] text-gray-600 dark:text-gray-300 italic line-clamp-3">
                  "{item.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-auto p-4 flex justify-center border-t border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={() => navigate('/admin/feedback')} // Assuming a feedback page might exist or can be linked here
          className="text-xs font-bold text-[#0f8c5b] tracking-wider uppercase hover:text-[#0c7249] transition-colors"
        >
          View All Reviews
        </button>
      </div>
    </div>
  );
}
