import { useState, useMemo, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Eye, ClipboardList, Search } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import useFetch from '../../hooks/useFetch';
import { getAllRequests } from '../../api/requests.api';


const STATUS_OPTIONS = ['', 'PENDING', 'QUOTED', 'SCHEDULED', 'COLLECTED', 'COMPLETED', 'REJECTED'];

// Custom badge to match mockup
function CustomStatusBadge({ status }) {
  if (!status) return null;
  const label = status.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  
  let styles = { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' };
  switch (status) {
    case 'PENDING':
      styles = { bg: 'bg-[#FFF8E6]', text: 'text-[#D97706]', dot: 'bg-[#F59E0B]' }; // Amber/Yellow
      break;
    case 'QUOTED':
    case 'PLACED':
      styles = { bg: 'bg-[#EBF5FF]', text: 'text-[#2563EB]', dot: 'bg-[#3B82F6]' }; // Blue
      break;
    case 'SCHEDULED':
      styles = { bg: 'bg-[#F3E8FF]', text: 'text-[#9333EA]', dot: 'bg-[#A855F7]' }; // Purple
      break;
    case 'COLLECTED':
    case 'COMPLETED':
    case 'DELIVERED':
      styles = { bg: 'bg-[#ECFDF5]', text: 'text-[#059669]', dot: 'bg-[#10B981]' }; // Green
      break;
    case 'REJECTED':
    case 'CANCELLED':
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

export default function AllRequests() {
  const navigate = useNavigate();

  /* ── local filter state ── */
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  /* ── fetch all requests (no query params — we filter client-side for search) ── */
  const fetchRequests = useCallback(() => getAllRequests(), []);
  const { data, loading, error } = useFetch(fetchRequests);
  const requests = data?.requests ?? [];

  /* ── client-side filtering & pagination ── */
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (dateFrom && new Date(r.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(r.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
      if (search) {
        const q = search.toLowerCase();
        const userName = r.user?.name?.toLowerCase() ?? '';
        const reqId = r.id?.toLowerCase() ?? '';
        if (!userName.includes(q) && !reqId.includes(q)) return false;
      }
      return true;
    });
  }, [requests, statusFilter, dateFrom, dateTo, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedRequests = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ── helpers ── */
  const renderMaterials = (items) => {
    if (!Array.isArray(items) || items.length === 0) return <span className="text-gray-400">—</span>;
    return (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, idx) => (
          <span key={idx} className="bg-gray-200/60 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {item.materialType}
          </span>
        ))}
      </div>
    );
  };

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Requests</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage and review every scrap pickup request.
        </p>
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
                placeholder="User name or request ID..."
                className="w-full text-sm border-none rounded-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A7A4A] font-medium"
              />
            </div>
          </div>

          {/* Clear */}
          {(statusFilter || dateFrom || dateTo || search) && (
            <button
              onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setSearch(''); setCurrentPage(1);}}
              className="text-sm text-red-500 hover:text-red-700 font-bold px-4 py-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
            >
              Clear
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
                  {['Request ID', 'User Name', 'Materials', 'Status', 'Assigned To', 'Date', 'Action'].map((h) => (
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
                    <td colSpan={7} className="px-6 py-16 text-center text-gray-400 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex flex-col items-center justify-center">
                        <ClipboardList size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-sm font-medium">No requests match your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors border-t border-gray-100 dark:border-gray-700 group"
                    >
                      <td className="px-6 py-5 text-xs font-mono text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                        <span className="text-gray-300 dark:text-gray-600">#</span>{r.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-900 dark:text-white font-bold whitespace-nowrap">
                        {r.user?.name ?? '—'}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {renderMaterials(r.items)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <CustomStatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                        {r.collector?.name ?? <span className="text-gray-400 font-medium">—</span>}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {formatStackedDate(r.createdAt)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <button
                          id={`view-request-${r.id}`}
                          onClick={() => navigate(`/admin/requests/${r.id}`)}
                          className="text-sm font-bold text-[#1A7A4A] dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
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

