import { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { ClipboardList, CheckCircle, Truck, XCircle, ShoppingCart, Search, RotateCcw } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAllOrders, confirmOrder, deliverOrder, cancelOrder } from '../../api/orders.api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatCurrency, formatWeight } from '../../utils/formatters';

const STATUS_OPTIONS = ['', 'PLACED', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];

export default function AllOrders() {
  const fetchOrders = useCallback(() => getAllOrders(), []);
  const { data, loading, refetch } = useFetch(fetchOrders);
  const [actionLoading, setActionLoading] = useState(null); // order id currently being actioned

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState(null); // order to cancel

  const orders = data?.orders ?? [];

  /* ── local filter state ── */
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  /* ── client-side filtering & pagination ── */
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (dateFrom && new Date(o.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(o.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
      if (search) {
        const q = search.toLowerCase();
        const buyerName = o.buyer?.name?.toLowerCase() ?? '';
        const orderId = o.id?.toLowerCase() ?? '';
        if (!buyerName.includes(q) && !orderId.includes(q)) return false;
      }
      return true;
    });
  }, [orders, statusFilter, dateFrom, dateTo, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedOrders = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  async function handleAction(id, action) {
    setActionLoading(id);
    try {
      if (action === 'confirm') {
        await confirmOrder(id);
        toast.success('Order confirmed.');
      } else if (action === 'deliver') {
        await deliverOrder(id);
        toast.success('Order marked as delivered.');
      } else if (action === 'cancel') {
        await cancelOrder(id);
        toast.success('Order cancelled. Stock released.');
      }
      refetch();
    } catch (err) {
      const msg = err?.response?.data?.error ?? 'Action failed.';
      toast.error(msg);
    } finally {
      setActionLoading(null);
      setCancelTarget(null);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage and process buyer purchase orders.
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
                placeholder="Buyer name or order ID..."
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

      <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-5 h-5 border-2 border-[#1A7A4A] border-t-transparent rounded-full animate-spin mr-2" />
            Loading orders…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ShoppingCart size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium">No buyer orders match your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  {['Order ID', 'Buyer', 'Material Type', 'Quantity', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
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
                {paginatedOrders.map((o) => {
                  const label = o.inventory?.materialType
                    ? o.inventory.materialType.charAt(0) +
                      o.inventory.materialType.slice(1).toLowerCase().replace('_', ' ')
                    : '—';
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors border-t border-gray-100 dark:border-gray-700 group">
                      <td className="px-6 py-5 text-xs font-mono text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                        <span className="text-gray-300 dark:text-gray-600">#</span>{o.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{o.buyer?.name ?? '—'}</p>
                        <p className="text-xs text-gray-500">{o.buyer?.email ?? ''}</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-900 dark:text-white font-bold whitespace-nowrap">
                        {label}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatWeight(o.quantityKg)}
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(o.totalPrice)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex gap-2 flex-wrap">
                          {/* Confirm — visible only for PLACED */}
                          {o.status === 'PLACED' && (
                            <button
                              id={`confirm-order-${o.id}`}
                              onClick={() => handleAction(o.id, 'confirm')}
                              disabled={actionLoading === o.id}
                              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {actionLoading === o.id ? (
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <CheckCircle size={13} />
                              )}
                              Confirm
                            </button>
                          )}

                          {/* Cancel — visible only for PLACED */}
                          {o.status === 'PLACED' && (
                            <button
                              id={`cancel-order-${o.id}`}
                              onClick={() => setCancelTarget(o)}
                              disabled={actionLoading === o.id}
                              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <XCircle size={13} />
                              Cancel
                            </button>
                          )}

                          {/* Mark Delivered — visible only for CONFIRMED */}
                          {o.status === 'CONFIRMED' && (
                            <button
                              id={`deliver-order-${o.id}`}
                              onClick={() => handleAction(o.id, 'deliver')}
                              disabled={actionLoading === o.id}
                              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {actionLoading === o.id ? (
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Truck size={13} />
                              )}
                              Mark Delivered
                            </button>
                          )}

                          {(o.status === 'DELIVERED' || o.status === 'CANCELLED') && (
                            <span className="text-xs text-gray-400 italic">
                              {o.status === 'DELIVERED' ? 'Completed' : 'Cancelled'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer pagination */}
        {!loading && orders.length > 0 && (
          <div className="px-6 pb-6 bg-white dark:bg-gray-800">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={orders.length}
              itemsPerPage={ITEMS_PER_PAGE}
              filteredCount={filtered.length}
            />
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancel Order"
        message={
          cancelTarget
            ? `Cancel order #${cancelTarget.id.slice(0, 8)} for ${formatWeight(cancelTarget.quantityKg)}? The reserved stock will be released back to inventory.`
            : ''
        }
        onConfirm={() => handleAction(cancelTarget.id, 'cancel')}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
