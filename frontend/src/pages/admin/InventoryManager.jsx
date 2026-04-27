import { useState, useCallback} from 'react';
import { Boxes, ChevronDown, Search } from 'lucide-react';
import Pagination from '../../components/common/Pagination';
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
  const isAvailable = availableKg > 0;
  return isAvailable ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#e6f4ea] text-[#1e8e3e]">
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fce8e6] text-[#d93025]">
      No
    </span>
  );
}

export default function InventoryManager() {
  const fetchInventory = useCallback(() => getAllInventory(), []);
  const { data, loading } = useFetch(fetchInventory);
  const allInventory = data?.inventory ?? [];

  const [materialFilter, setMaterialFilter] = useState('');
  const [availFilter, setAvailFilter] = useState('all'); // 'all' | 'yes' | 'no'
  const [searchTerm, setSearchTerm] = useState('');

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = allInventory.filter((item) => {
    if (materialFilter && item.materialType !== materialFilter) return false;
    if (availFilter === 'yes' && !(item.availableKg > 0)) return false;
    if (availFilter === 'no'  &&   item.availableKg > 0)  return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesId = item.id.toLowerCase().includes(term);
      const matchesMaterial = item.materialType.toLowerCase().includes(term);
      if (!matchesId && !matchesMaterial) return false;
    }
    return true;
  });

  const paginatedInventory = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
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
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-4 mb-6 flex flex-wrap justify-between items-center gap-4 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap gap-3">
          {/* Material type */}
          <div className="relative">
            <select
              value={materialFilter}
              onChange={(e) => {
                setMaterialFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors border-none rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10 cursor-pointer"
            >
              {MATERIAL_TYPES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Availability */}
          <div className="relative">
            <select
              value={availFilter}
              onChange={(e) => {
                setAvailFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors border-none rounded-full px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10 cursor-pointer"
            >
              <option value="all">All Availability</option>
              <option value="yes">Available (&gt; 0 kg)</option>
              <option value="no">Fully Reserved / Sold</option>
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory ID or material..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-[320px] bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors border-none rounded-full pl-11 pr-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm p-6 border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading inventory…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Boxes size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm font-medium">No inventory records found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto pb-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {[
                      { label: 'ID', align: 'left' },
                      { label: 'Material Type', align: 'left' },
                      { label: 'Total (kg)', align: 'center' },
                      { label: 'Reserved (kg)', align: 'center' },
                      { label: 'Available (kg)', align: 'center' },
                      { label: 'Price/kg', align: 'center' },
                      { label: 'Est. Value', align: 'center' },
                      { label: 'In Stock', align: 'center' },
                      { label: 'Source Request', align: 'center' },
                      { label: 'Created', align: 'center' },
                    ].map((h) => (
                      <th
                        key={h.label}
                        className={`px-4 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap text-${h.align}`}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {paginatedInventory.map((item) => {
                    const totalKg     = parseFloat(item.totalKg);
                    const reservedKg  = parseFloat(item.reservedKg);
                    const availableKg = item.availableKg ?? (totalKg - reservedKg);
                    const estValue    = availableKg * parseFloat(item.pricePerKg);
                    const label = item.materialType.charAt(0) +
                      item.materialType.slice(1).toLowerCase().replace('_', ' ');

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/40 transition-colors group">
                        <td className="px-4 py-5 text-xs font-medium text-gray-500 dark:text-gray-400 text-left">
                          #{item.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-5 text-sm font-semibold text-gray-900 dark:text-white text-left">
                          {label}
                        </td>

                        {/* Total */}
                        <td className="px-4 py-5 text-sm font-bold text-gray-800 dark:text-gray-200 text-center">
                          {totalKg.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </td>

                        {/* Reserved */}
                        <td className="px-4 py-5 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
                          {reservedKg.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </td>

                        {/* Available */}
                        <td className={`px-4 py-5 text-sm font-bold text-center ${
                          availableKg <= 0 ? 'text-red-500' : 'text-teal-600 dark:text-teal-400'
                        }`}>
                          {availableKg.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </td>

                        <td className="px-4 py-5 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
                          {formatCurrency(item.pricePerKg)}
                        </td>
                        <td className="px-4 py-5 text-sm font-bold text-gray-900 dark:text-white text-center">
                          {formatCurrency(estValue)}
                        </td>
                        <td className="px-4 py-5 text-center">
                          <AvailableBadge availableKg={availableKg} />
                        </td>
                        <td className="px-4 py-5 text-xs font-medium text-gray-400 dark:text-gray-500 text-center">
                          {item.requestId ? `REQ-${item.requestId.slice(0, 4)}` : '—'}
                        </td>
                        <td className="px-4 py-5 text-sm font-medium text-gray-500 dark:text-gray-400 text-center whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            <Pagination 
              currentPage={currentPage}
              totalPages={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              totalItems={allInventory.length}
              itemsPerPage={ITEMS_PER_PAGE}
              filteredCount={filtered.length}
            />

          </>
        )}
      </div>
    </div>
  );
}
