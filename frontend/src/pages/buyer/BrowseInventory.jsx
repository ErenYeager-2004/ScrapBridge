import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Recycle, Package, Layers, Droplets, Cpu, Zap, Flame,
  Filter, ShoppingCart, X, ChevronDown,
} from 'lucide-react';
import { getInventory } from '../../api/inventory.api';
import { placeOrder } from '../../api/orders.api';
import useFetch from '../../hooks/useFetch';
import { formatCurrency, getRelativeTime } from '../../utils/formatters';

/* ── Material type config ─────────────────────────────────────── */
const MATERIAL_TYPES = [
  { value: '', label: 'All Materials' },
  { value: 'STEEL', label: 'Steel' },
  { value: 'COPPER', label: 'Copper' },
  { value: 'ALUMINIUM', label: 'Aluminium' },
  { value: 'BRASS', label: 'Brass' },
  { value: 'PLASTIC', label: 'Plastic' },
  { value: 'PET_BOTTLES', label: 'PET Bottles' },
  { value: 'CARDBOARD', label: 'Cardboard' },
  { value: 'PAPER', label: 'Paper' },
  { value: 'GLASS', label: 'Glass' },
  { value: 'EWASTE', label: 'E-Waste' },
];

const MATERIAL_ICONS = {
  STEEL:       { Icon: Layers,   color: 'bg-slate-500',  text: 'text-slate-50' },
  COPPER:      { Icon: Zap,      color: 'bg-orange-500', text: 'text-orange-50' },
  ALUMINIUM:   { Icon: Layers,   color: 'bg-gray-400',   text: 'text-gray-50' },
  BRASS:       { Icon: Zap,      color: 'bg-yellow-500', text: 'text-yellow-50' },
  PLASTIC:     { Icon: Recycle,  color: 'bg-blue-500',   text: 'text-blue-50' },
  PET_BOTTLES: { Icon: Droplets, color: 'bg-cyan-500',   text: 'text-cyan-50' },
  CARDBOARD:   { Icon: Package,  color: 'bg-amber-600',  text: 'text-amber-50' },
  PAPER:       { Icon: Package,  color: 'bg-amber-400',  text: 'text-amber-50' },
  GLASS:       { Icon: Droplets, color: 'bg-teal-500',   text: 'text-teal-50' },
  EWASTE:      { Icon: Cpu,      color: 'bg-violet-500', text: 'text-violet-50' },
  MIXED:       { Icon: Flame,    color: 'bg-green-600',  text: 'text-green-50' },
};

/* ── Inventory card ───────────────────────────────────────────── */
function InventoryCard({ item, onOrder }) {
  // availableKg is the backend-computed field (totalKg - reservedKg)
  const availableKg = item.availableKg ?? 0;
  const { Icon, color, text } =
    MATERIAL_ICONS[item.materialType] ?? { Icon: Package, color: 'bg-gray-500', text: 'text-gray-50' };
  const totalValue = availableKg * parseFloat(item.pricePerKg);
  const label = item.materialType.charAt(0) + item.materialType.slice(1).toLowerCase().replace('_', ' ');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Colour header */}
      <div className={`${color} p-5 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon size={20} className={text} />
        </div>
        <div>
          <p className={`font-semibold text-sm ${text}`}>{label}</p>
          <p className={`text-xs opacity-75 ${text}`}>
            {item.request?.pickupAddress ?? 'Unknown source'}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {availableKg.toFixed(1)}
              <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-1">kg</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Available weight</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {formatCurrency(item.pricePerKg)}
              <span className="font-normal text-gray-400">/kg</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Est. value: {formatCurrency(totalValue)}
            </p>
          </div>
        </div>

        {item.request?.createdAt && (
          <p className="text-xs text-gray-400">
            Collected {getRelativeTime(item.request.createdAt)}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        <button
          id={`order-btn-${item.id}`}
          onClick={() => onOrder(item)}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <ShoppingCart size={15} />
          Place Order
        </button>
      </div>
    </div>
  );
}

/* ── Order modal ──────────────────────────────────────────────── */
function OrderModal({ item, onClose, onSuccess }) {
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // availableKg is the computed field from the backend
  const availableKg = item ? (item.availableKg ?? 0) : 0;
  const preview = qty && !isNaN(qty)
    ? parseFloat(qty) * parseFloat(item?.pricePerKg ?? 0)
    : null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const parsed = parseFloat(qty);

    if (!parsed || parsed <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }
    // Client-side guard before even calling the API
    if (parsed > availableKg) {
      setError(`Quantity cannot exceed available stock (${availableKg.toFixed(2)} kg).`);
      return;
    }

    setLoading(true);
    try {
      await placeOrder({ inventoryId: item.id, quantityKg: parsed });
      toast.success('Order placed successfully!');
      onSuccess();
    } catch (err) {
      // Server-side guard message (race condition caught by DB transaction)
      const msg = err?.response?.data?.error ?? 'Failed to place order.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!item) return null;

  const label = item.materialType.charAt(0) + item.materialType.slice(1).toLowerCase().replace('_', ' ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Place Order</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          {label} — {formatCurrency(item.pricePerKg)}/kg ·{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {availableKg.toFixed(2)} kg available
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity (kg)
            </label>
            <input
              id="order-qty-input"
              type="number"
              min="0.01"
              step="0.01"
              max={availableKg}
              value={qty}
              onChange={(e) => { setQty(e.target.value); setError(''); }}
              placeholder={`Max ${availableKg.toFixed(2)} kg`}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {preview !== null && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                Estimated Total: {formatCurrency(preview)}
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              id="order-confirm-btn"
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Confirm Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function BrowseInventory() {
  const [filters, setFilters] = useState({ materialType: '', minWeight: '', maxPrice: '' });
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);

  const fetcher = useCallback(
    () => getInventory(activeFilters),
    [activeFilters]
  );
  const { data, loading, refetch } = useFetch(fetcher, [activeFilters]);
  const inventory = data?.inventory ?? [];

  function applyFilters() {
    const clean = {};
    if (filters.materialType) clean.materialType = filters.materialType;
    if (filters.minWeight)    clean.minWeight    = filters.minWeight;
    if (filters.maxPrice)     clean.maxPrice     = filters.maxPrice;
    setActiveFilters(clean);
  }

  function clearFilters() {
    setFilters({ materialType: '', minWeight: '', maxPrice: '' });
    setActiveFilters({});
  }

  function handleOrderSuccess() {
    setSelectedItem(null);
    refetch();
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Inventory</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Browse available scrap materials and place purchase orders.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Material type */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Material Type
            </label>
            <div className="relative">
              <select
                id="filter-material-type"
                value={filters.materialType}
                onChange={(e) => setFilters((f) => ({ ...f, materialType: e.target.value }))}
                className="w-full appearance-none border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
              >
                {MATERIAL_TYPES.map((mt) => (
                  <option key={mt.value} value={mt.value}>{mt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Min weight */}
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Min Weight (kg)
            </label>
            <input
              id="filter-min-weight"
              type="number"
              min="0"
              step="0.1"
              value={filters.minWeight}
              onChange={(e) => setFilters((f) => ({ ...f, minWeight: e.target.value }))}
              placeholder="e.g. 10"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Max price */}
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Max Price/kg (₹)
            </label>
            <input
              id="filter-max-price"
              type="number"
              min="0"
              step="0.5"
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
              placeholder="e.g. 50"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              id="apply-filters-btn"
              onClick={applyFilters}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Filter size={14} />
              Apply
            </button>
            {Object.keys(activeFilters).length > 0 && (
              <button
                id="clear-filters-btn"
                onClick={clearFilters}
                className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium px-3 py-2 rounded-xl transition-colors"
              >
                <X size={14} />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-3" />
          Loading inventory…
        </div>
      )}

      {/* Empty state */}
      {!loading && inventory.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Package size={52} className="text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-base font-medium text-gray-500 dark:text-gray-400">
            No inventory available right now. Check back soon!
          </p>
          <p className="text-sm text-gray-400 mt-1">
            New materials get listed as scrap requests are completed.
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && inventory.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {inventory.map((item) => (
            <InventoryCard key={item.id} item={item} onOrder={setSelectedItem} />
          ))}
        </div>
      )}

      {/* Order modal */}
      <OrderModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
}
