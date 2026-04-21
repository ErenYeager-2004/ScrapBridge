import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Clock, TrendingUp, ArrowRight, Package } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getMyOrders } from '../../api/orders.api';
import { getInventory } from '../../api/inventory.api';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency, formatWeight } from '../../utils/formatters';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function BuyerDashboard() {
  const navigate = useNavigate();

  const { data: ordersData, loading: ordersLoading } = useFetch(() => getMyOrders(), []);
  const { data: invData, loading: invLoading } = useFetch(() => getInventory(), []);

  const orders = ordersData?.orders ?? [];
  const inventory = invData?.inventory ?? [];

  /* ── Stats ── */
  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) =>
    ['PLACED', 'CONFIRMED'].includes(o.status)
  ).length;
  const totalSpent = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + parseFloat(o.totalPrice || 0), 0);

  /* ── Sections ── */
  const recentOrders = [...orders].slice(0, 5);
  const topInventory = [...inventory].slice(0, 3);

  const loading = ordersLoading || invLoading;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buyer Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your ScrapBridge buying overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={loading ? '…' : totalOrders}
          color="bg-blue-500"
        />
        <StatCard
          icon={Clock}
          label="Active Orders"
          value={loading ? '…' : activeOrders}
          color="bg-amber-500"
          sub="Placed + Confirmed"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Spent"
          value={loading ? '…' : formatCurrency(totalSpent)}
          color="bg-green-600"
          sub="Delivered orders"
        />
      </div>

      {/* Inventory highlights */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Available Inventory Highlights
          </h2>
          <button
            id="browse-all-btn"
            onClick={() => navigate('/buyer/inventory')}
            className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
          >
            Browse All <ArrowRight size={12} />
          </button>
        </div>

        {invLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading…
          </div>
        ) : topInventory.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-400">
            <Package size={36} className="text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm">No inventory available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-700">
            {topInventory.map((item) => {
              const availableKg = item.availableKg ?? 0;
              return (
                <div key={item.id} className="p-5">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                    {item.materialType}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {availableKg.toFixed(1)} kg
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatCurrency(item.pricePerKg)}/kg
                  </p>
                  <button
                    onClick={() => navigate('/buyer/inventory')}
                    className="mt-3 text-xs text-green-600 dark:text-green-400 hover:underline"
                  >
                    Order →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Orders</h2>
          <button
            id="view-all-orders-btn"
            onClick={() => navigate('/buyer/orders')}
            className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  {['Order ID', 'Material', 'Quantity', 'Total', 'Status', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                      No orders yet. <button onClick={() => navigate('/buyer/inventory')} className="text-green-600 hover:underline">Browse inventory →</button>
                    </td>
                  </tr>
                ) : recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-400">#{o.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium">
                      {o.inventory?.materialType
                        ? o.inventory.materialType.charAt(0) + o.inventory.materialType.slice(1).toLowerCase()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatWeight(o.quantityKg)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(o.totalPrice)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
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
