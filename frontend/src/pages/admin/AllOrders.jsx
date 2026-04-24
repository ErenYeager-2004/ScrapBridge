import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ClipboardList, CheckCircle, Truck, XCircle, ShoppingCart } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAllOrders, confirmOrder, deliverOrder, cancelOrder } from '../../api/orders.api';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate, formatCurrency, formatWeight } from '../../utils/formatters';

export default function AllOrders() {
  const fetchOrders = useCallback(() => getAllOrders(), []);
  const { data, loading, refetch } = useFetch(fetchOrders);
  const [actionLoading, setActionLoading] = useState(null); // order id currently being actioned

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState(null); // order to cancel

  const orders = data?.orders ?? [];

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

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ShoppingCart size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium">No buyer orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  {['Order ID', 'Buyer', 'Material Type', 'Quantity', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map((o) => {
                  const label = o.inventory?.materialType
                    ? o.inventory.materialType.charAt(0) +
                      o.inventory.materialType.slice(1).toLowerCase().replace('_', ' ')
                    : '—';
                  return (
                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">
                        #{o.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{o.buyer?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{o.buyer?.email ?? ''}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {label}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatWeight(o.quantityKg)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(o.totalPrice)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3">
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
