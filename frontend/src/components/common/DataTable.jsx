import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

/**
 * DataTable — generic filterable table.
 *
 * Props:
 *  columns   (array of { key, label, render? })  — table column definitions
 *  data      (array of objects)                  — table rows
 *  onRowClick(fn, optional)                      — called with the row object on row click
 */
export default function DataTable({ columns = [], data = [], onRowClick }) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter.trim()) return data;
    const q = filter.toLowerCase();
    return data.filter((row) =>
      columns.some(({ key }) => {
        const val = row[key];
        return typeof val === 'string' && val.toLowerCase().includes(q);
      })
    );
  }, [data, columns, filter]);

  return (
    <div className="w-full">
      {/* Filter input */}
      <div className="mb-4 relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search…"
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                  No data found.
                </td>
              </tr>
            ) : (
              filtered.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map(({ key, render }) => (
                    <td
                      key={key}
                      className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {render ? render(row[key], row) : (row[key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
