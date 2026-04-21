/**
 * formatters.js — Shared utility helpers for consistent data display.
 */

/**
 * Returns a readable date string: "12 Apr 2025"
 * @param {string|Date} dateString
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Returns an Indian-currency formatted string: "₹ 2,400.00"
 * @param {number} amount
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '₹ 0.00';
  return (
    '₹ ' +
    Number(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Returns a weight string: "120.5 kg"
 * @param {number} kg
 */
export function formatWeight(kg) {
  if (kg == null || isNaN(kg)) return '0 kg';
  return `${parseFloat(kg)} kg`;
}

/**
 * Capitalises the first letter of a string.
 * @param {string} str
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Returns a human-relative time string: "2 mins ago", "3 days ago".
 * @param {string|Date} dateString
 */
export function getRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
}
