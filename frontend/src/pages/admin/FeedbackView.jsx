import { useState, useMemo } from 'react';
import { Star, MessageSquare, Users, Search, Calendar, ChevronDown, Filter, RotateCcw } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { getAllFeedback } from '../../api/feedback.api';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';

export default function FeedbackView() {
  const { data, loading, error } = useFetch(getAllFeedback, []);

  const averageRating = data?.averageRating ?? null;
  const totalCount    = data?.totalCount    ?? 0;
  const feedbackList  = data?.feedback      ?? [];

  // --- State for Filtering and Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Get today's date in YYYY-MM-DD format based on local time
  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [filters, setFilters] = useState({
    rating: 'all',
    fromDate: '',
    toDate: getLocalToday(),
    search: '',
  });

  const handleResetFilters = () => {
    setFilters({
      rating: 'all',
      fromDate: '',
      toDate: getLocalToday(),
      search: '',
    });
    setCurrentPage(1);
  };

  // --- Helper for Initials ---
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  // --- Filter Logic ---
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter(fb => {
      // Rating filter
      if (filters.rating !== 'all' && fb.rating !== Number(filters.rating)) {
        return false;
      }
      // Date filters
      if (filters.fromDate && new Date(fb.createdAt) < new Date(filters.fromDate)) {
        return false;
      }
      if (filters.toDate) {
        const toDateObj = new Date(filters.toDate);
        toDateObj.setHours(23, 59, 59, 999);
        if (new Date(fb.createdAt) > toDateObj) {
          return false;
        }
      }
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const userName = fb.user?.name?.toLowerCase() || '';
        const requestId = fb.requestId?.toLowerCase() || '';
        if (!userName.includes(query) && !requestId.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [feedbackList, filters]);

  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage) || 1;
  
  // --- Pagination Logic ---
  const paginatedFeedback = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFeedback.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFeedback, currentPage]);


  // --- Custom Stars for Table ---
  const GreenStarRating = ({ value }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={
            star <= value
              ? 'text-[#1A7A4A] fill-[#1A7A4A]'
              : 'text-gray-200 dark:text-gray-600 fill-gray-200 dark:fill-gray-600'
          }
        />
      ))}
    </div>
  );

  /* ─── Render ───────────────────────────────────────────── */
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Star size={22} className="text-amber-400 fill-amber-400" />
            Customer Feedback
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Reviews submitted by home users after completed pickups.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Average rating */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Star size={26} className="text-amber-500 fill-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Average Rating
            </p>
            {averageRating !== null ? (
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-xl text-amber-400">★</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No ratings yet</p>
            )}
          </div>
        </div>

        {/* Total reviews */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <Users size={26} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              Total Reviews
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
              {totalCount}
            </p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-sm p-2 flex flex-col md:flex-row items-center gap-4 mt-8">
        
        {/* Rating Filter */}
        <div className="flex flex-col ml-4">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Rating</label>
          <div className="relative">
            <select
              value={filters.rating}
              onChange={(e) => { setFilters(prev => ({ ...prev, rating: e.target.value })); setCurrentPage(1); }}
              className="appearance-none bg-gray-50 dark:bg-gray-900 border-none rounded-full pl-4 pr-10 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500 cursor-pointer min-w-[140px]"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* From Date */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">From Date</label>
          <div className="relative">
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => { setFilters(prev => ({ ...prev, fromDate: e.target.value })); setCurrentPage(1); }}
              className="bg-gray-50 dark:bg-gray-900 border-none rounded-full pl-4 pr-10 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">To Date</label>
          <div className="relative">
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => { setFilters(prev => ({ ...prev, toDate: e.target.value })); setCurrentPage(1); }}
              className="bg-gray-50 dark:bg-gray-900 border-none rounded-full pl-4 pr-10 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col flex-1 w-full md:mt-0">
           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Search</label>
           <div className="relative w-full">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <input
               type="text"
               placeholder="User name or request ID..."
               value={filters.search}
               onChange={(e) => { setFilters(prev => ({ ...prev, search: e.target.value })); setCurrentPage(1); }}
               className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-full pl-11 pr-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500"
             />
           </div>
        </div>

        {/* Reset Button */}
        <div className="flex flex-col md:mt-0 mt-2 mr-4">
          <label className="text-[10px] font-bold opacity-0 mb-1 hidden md:block">Reset</label>
          <button 
            onClick={handleResetFilters}
            title="Reset Filters"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors shrink-0"
          >
            <RotateCcw size={16} />
          </button>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6 px-2">
           <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Feedback</h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-[#1A7A4A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="py-16 text-center text-red-500 font-medium">
            Failed to load feedback. Please refresh the page.
          </div>
        )}

        {!loading && !error && filteredFeedback.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Star size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-base font-medium">No feedback found matching the criteria.</p>
          </div>
        )}

        {!loading && filteredFeedback.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-gray-100 dark:border-gray-700">
                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-1/4">User</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Request ID</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Rating</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest w-1/3">Comment</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {paginatedFeedback.map((fb) => (
                    <tr key={fb.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                            {getInitials(fb.user?.name)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                              {fb.user?.name || 'Unknown User'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-mono text-gray-500 dark:text-gray-400 text-sm">
                        REQ-{(fb.requestId?.split('-')[1] || fb.requestId?.slice(0, 4))?.toUpperCase()}
                      </td>
                      <td className="px-6 py-5">
                        <GreenStarRating value={fb.rating} />
                      </td>
                      <td className="px-6 py-5">
                        {fb.comment ? (
                          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                            "{fb.comment}"
                          </p>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                        {formatDate(fb.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <div className="px-4 pb-2 mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={feedbackList.length}
                itemsPerPage={itemsPerPage}
                filteredCount={filteredFeedback.length}
              />
            </div>
          </>
        )}
      </div>

    </div>
  );
}
