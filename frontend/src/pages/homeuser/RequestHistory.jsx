import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, RotateCcw } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { getMyRequests } from '../../api/requests.api';
import Pagination from '../../components/common/Pagination';
import { formatWeight } from '../../utils/formatters';

const STATUS_OPTIONS = ['', 'PENDING', 'QUOTED', 'ACCEPTED', 'SCHEDULED', 'COLLECTED', 'COMPLETED', 'REJECTED'];

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

// Summarise items
function summariseItems(items = []) {
  if (!items || items.length === 0) return '—';
  const first = MATERIAL_LABELS[items[0]?.materialType] ?? items[0]?.materialType;
  const rest  = items.length - 1;
  return rest > 0 ? `${first} and ${rest} more` : first;
}

// Custom badge to match AllRequests
function CustomStatusBadge({ status }) {
  if (!status) return null;
  const label = status.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  
  let styles = { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
  switch (status) {
    case 'PENDING':
      styles = { bg: 'bg-[#FFF8E6]', text: 'text-[#D97706]', dot: 'bg-[#F59E0B]' }; // Amber/Yellow
      break;
    case 'QUOTED':
    case 'ACCEPTED':
      styles = { bg: 'bg-[#EBF5FF]', text: 'text-[#2563EB]', dot: 'bg-[#3B82F6]' }; // Blue
      break;
    case 'SCHEDULED':
      styles = { bg: 'bg-[#F3E8FF]', text: 'text-[#9333EA]', dot: 'bg-[#A855F7]' }; // Purple
      break;
    case 'COLLECTED':
    case 'COMPLETED':
      styles = { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', dot: 'bg-[#10B981]' }; // Green
      break;
    case 'REJECTED':
      styles = { bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]', dot: 'bg-[#EF4444]' }; // Red
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles.bg} ${styles.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`}></span>
      {label}
    </span>
  );
}

export default function RequestHistory() {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const fetchRequests = useCallback(() => getMyRequests(), []);
  const { data, loading, error } = useFetch(fetchRequests);
  const requests = data?.requests ?? data ?? [];

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (dateFrom && new Date(r.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(r.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
      if (search) {
        const q = search.toLowerCase();
        const reqId = r.id?.toLowerCase() ?? '';
        const materials = (r.items || []).map(i => (MATERIAL_LABELS[i.materialType] || i.materialType).toLowerCase()).join(' ');
        if (!reqId.includes(q) && !materials.includes(q)) return false;
      }
      return true;
    });
  }, [requests, statusFilter, dateFrom, dateTo, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedRequests = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const formatStackedDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return '—';
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return (
      <div className="text-xs text-gray-500 font-medium">
        <div>{month} {day},</div>
        <div>{year}</div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track all your scrap pickup requests in one place.
          </p>
        </div>
        <button
          onClick={() => navigate('/user/new-request')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A7A4A] hover:bg-green-700 text-white rounded-full text-sm font-bold transition-colors shadow-sm"
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-5 lg:p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Status */}
          <div className="flex flex-col gap-2 min-w-[160px] flex-1 lg:flex-none">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-sm appearance-none border-none rounded-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] cursor-pointer pr-8 font-medium"
              >
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.filter(Boolean).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-2 flex-1 lg:flex-none">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) =>{
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-sm border-none rounded-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] font-medium"
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-2 flex-1 lg:flex-none">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) =>{
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-sm border-none rounded-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] font-medium"
            />
          </div>

          {/* Search */}
          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Request ID or materials..."
                className="w-full text-sm border-none rounded-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] font-medium"
              />
            </div>
          </div>

          {/* Clear */}
          {(statusFilter || dateFrom || dateTo || search) && (
            <button
              onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setSearch(''); setCurrentPage(1);}}
              title="Reset Filters"
              className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-100 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors shrink-0"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-6 h-6 border-2 border-[#1A7A4A] border-t-transparent rounded-full animate-spin mr-3" />
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
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {['Request ID', 'Materials', 'Weight', 'Status', 'Date', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-5 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap bg-white dark:bg-gray-800"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-400 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex flex-col items-center justify-center">
                        <ClipboardList size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-sm font-medium">
                          {requests.length === 0 && !statusFilter && !dateFrom && !dateTo && !search
                            ? 'No requests yet. Submit your first pickup request!'
                            : 'No requests match your criteria.'}
                        </p>
                        {requests.length === 0 && !statusFilter && !dateFrom && !dateTo && !search && (
                          <button
                            onClick={() => navigate('/user/new-request')}
                            className="mt-4 px-5 py-2 bg-[#1A7A4A] hover:bg-green-700 text-white text-sm font-bold rounded-full transition-colors shadow-sm"
                          >
                            New Request
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req) => {
                    const totalWeight = (req.items ?? []).reduce(
                      (acc, i) => acc + (i.estimatedWeight ?? 0),
                      0
                    );
                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors border-t border-gray-100 dark:border-gray-700 group"
                      >
                        <td className="px-6 py-5 text-xs font-mono text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                          <span className="text-gray-300 dark:text-gray-600">#</span>{req.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-900 dark:text-white font-bold whitespace-nowrap">
                          {summariseItems(req.items)}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {formatWeight(totalWeight)}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <CustomStatusBadge status={req.status} />
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {formatStackedDate(req.createdAt)}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/user/requests/${req.id}`)}
                            className="text-sm font-bold text-[#1A7A4A] dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer pagination */}
        {!loading && !error && (
          <div className="px-6 pb-6 bg-white dark:bg-gray-800">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={requests.length}
              itemsPerPage={ITEMS_PER_PAGE}
              filteredCount={filtered.length}
            />
          </div>
        )}
      </div>
    </div>
  );
}
