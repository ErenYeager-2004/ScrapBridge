import { useCallback } from 'react';
import { ClipboardList, ShoppingCart } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getMyOrders } from '../../api/orders.api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency, formatWeight } from '../../utils/formatters';

export default function OrderHistory() {
  const fetchOrders = useCallback(() => getMyOrders(), []);
  const { data, loading } = useFetch(fetchOrders);
  const orders = data?.orders ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track all your purchase orders and their current status.
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
            <p className="text-sm font-medium">You haven't placed any orders yet.</p>
            <p className="text-xs mt-1">Browse the inventory to place your first order.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  {['Order ID', 'Material Type', 'Quantity', 'Price/kg', 'Total', 'Status', 'Order Date'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">
                      #{o.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {o.inventory?.materialType
                        ? o.inventory.materialType.charAt(0) + o.inventory.materialType.slice(1).toLowerCase()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatWeight(o.quantityKg)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {formatCurrency(o.inventory?.pricePerKg)}
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
