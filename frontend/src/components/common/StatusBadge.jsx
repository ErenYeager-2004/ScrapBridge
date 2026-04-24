/**
 * StatusBadge — renders a colour-coded pill based on status string.
 * Props: status (string)
 */

const STATUS_STYLES = {
  PENDING:   'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  QUOTED:    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  REJECTED:  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  SCHEDULED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  COLLECTED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  PLACED:    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CONFIRMED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

/**
 * Converts "SOME_STATUS" → "Some Status"
 */
function formatStatusLabel(status) {
  if (!status) return '';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function StatusBadge({ status }) {
  const colorClass = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700';
  const label = formatStatusLabel(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}
    >
      {label}
    </span>
  );
}
