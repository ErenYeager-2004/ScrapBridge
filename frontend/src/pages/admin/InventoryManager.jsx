import { useState } from 'react';
import { Boxes, ChevronDown } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { getAllInventory } from '../../api/inventory.api';
import { formatDate, formatCurrency } from '../../utils/formatters';

const MATERIAL_TYPES = [
  { value: '', label: 'All Types' },
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

function AvailableBadge({ availableKg }) {
  // Base the badge on the computed availableKg, not just the boolean field
  const isAvailable = availableKg > 0;
  return isAvailable ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      No
    </span>
  );
}

export default function InventoryManager() {
  const { data, loading } = useFetch(() => getAllInventory(), []);
  const allInventory = data?.inventory ?? [];

  const [materialFilter, setMaterialFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('all'); // 'all' | 'yes' | 'no'

  const filtered = allInventory.filter((item) => {
    if (materialFilter && item.materialType !== materialFilter) return false;
    if (availFilter === 'yes' && !(item.availableKg > 0)) return false;
    if (availFilter === 'no'  &&   item.availableKg > 0)  return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Manager</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          View all inventory records. <span className="font-medium">Total</span> = original listed weight ·{' '}
          <span className="font-medium">Reserved</span> = pending orders ·{' '}
          <span className="font-medium">Available</span> = Total − Reserved.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Material type */}
          <div className="flex-1 min-w-[160px] max-w-[220px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Material Type
            </label>
            <div className="relative">
              <select
                id="inv-filter-material"
                value={materialFilter}
                onChange={(e) => setMaterialFilter(e.target.value)}
                className="w-full appearance-none border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
              >
                {MATERIAL_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Availability */}
          <div className="flex-1 min-w-[140px] max-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Availability
            </label>
            <div className="relative">
              <select
                id="inv-filter-avail"
                value={availFilter}
                onChange={(e) => setAvailFilter(e.target.value)}
                className="w-full appearance-none border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 pr-8"
              >
                <option value="all">All</option>
                <option value="yes">Available (&gt; 0 kg)</option>
                <option value="no">Fully Reserved / Sold</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-auto pb-2">
            Showing {filtered.length} of {allInventory.length} records
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading inventory…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Boxes size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium">No inventory records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  {[
                    'ID',
                    'Material Type',
                    'Total (kg)',
                    'Reserved (kg)',
                    'Available (kg)',
                    'Price/kg',
                    'Est. Value',
                    'In Stock',
                    'Source Request',
                    'Created',
                  ].map((h) => (
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
                {filtered.map((item) => {
                  const totalKg     = parseFloat(item.totalKg);
                  const reservedKg  = parseFloat(item.reservedKg);
                  const availableKg = item.availableKg ?? (totalKg - reservedKg);
                  const estValue    = availableKg * parseFloat(item.pricePerKg);
                  const label = item.materialType.charAt(0) +
                    item.materialType.slice(1).toLowerCase().replace('_', ' ');

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">
                        #{item.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {label}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {totalKg.toFixed(2)}
                      </td>

                      {/* Reserved — highlight if > 0 */}
                      <td className="px-4 py-3 text-sm">
                        <span className={reservedKg > 0 ? 'font-semibold text-amber-600 dark:text-amber-400' : 'text-gray-400'}>
                          {reservedKg.toFixed(2)}
                        </span>
                      </td>

                      {/* Available — highlight colour based on value */}
                      <td className="px-4 py-3 text-sm font-semibold">
                        <span className={
                          availableKg <= 0
                            ? 'text-red-500'
                            : availableKg < totalKg * 0.3
                              ? 'text-amber-500'
                              : 'text-emerald-600 dark:text-emerald-400'
                        }>
                          {availableKg.toFixed(2)}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {formatCurrency(item.pricePerKg)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(estValue)}
                      </td>
                      <td className="px-4 py-3">
                        <AvailableBadge availableKg={availableKg} />
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">
                        {item.requestId ? `#${item.requestId.slice(0, 8)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
