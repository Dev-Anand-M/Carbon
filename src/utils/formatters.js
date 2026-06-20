/**
 * @fileoverview Number, date, and display formatting utilities.
 * All functions are pure — no side effects.
 * @module utils/formatters
 */

/**
 * Format a number with locale-appropriate thousand separators.
 * @param {number} value - The number to format.
 * @param {number} [decimals=0] - Decimal places.
 * @returns {string} Formatted number string.
 */
export function formatNumber(value, decimals = 0) {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format kg CO₂ with appropriate unit (kg or tonnes).
 * @param {number} kgCO2 - Emissions in kg CO₂e.
 * @param {Object} [options] - Formatting options.
 * @param {boolean} [options.short=false] - Use short unit labels.
 * @returns {string} Formatted emission string.
 */
export function formatEmissions(kgCO2, options = {}) {
  const { short = false } = options;
  if (!Number.isFinite(kgCO2) || kgCO2 < 0) return short ? '0 kg' : '0 kg CO₂e';

  if (kgCO2 >= 1000) {
    const tonnes = kgCO2 / 1000;
    const formatted = formatNumber(tonnes, tonnes < 10 ? 2 : 1);
    return short ? `${formatted} t` : `${formatted} tonnes CO₂e`;
  }

  const formatted = formatNumber(kgCO2, kgCO2 < 10 ? 2 : 0);
  return short ? `${formatted} kg` : `${formatted} kg CO₂e`;
}

/**
 * Format a date as a readable string.
 * @param {Date|string|number} date - Date to format.
 * @param {string} [style='medium'] - Format style: 'short', 'medium', 'long'.
 * @returns {string} Formatted date string.
 */
export function formatDate(date, style = 'medium') {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';

  const options = {
    short: { day: 'numeric', month: 'short' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  };

  return d.toLocaleDateString('en-IN', options[style] || options.medium);
}

/**
 * Format a relative time string (e.g., "2 days ago").
 * @param {Date|string|number} date - The date to compare.
 * @returns {string} Relative time string.
 */
export function formatRelativeTime(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Unknown';

  const now = new Date();
  const diffMs = now - d;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return formatDate(d, 'medium');
}

/**
 * Format a percentage value.
 * @param {number} value - Percentage value (0-100).
 * @param {number} [decimals=1] - Decimal places.
 * @returns {string} Formatted percentage.
 */
export function formatPercentage(value, decimals = 1) {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get a colour class based on emission level relative to a target.
 * @param {number} value - Current emission value.
 * @param {number} target - Target emission value.
 * @returns {'good'|'moderate'|'poor'} Status indicator.
 */
export function getEmissionStatus(value, target) {
  if (value <= target) return 'good';
  if (value <= target * 1.5) return 'moderate';
  return 'poor';
}

/**
 * Format a streak count into a human-readable string.
 * @param {number} days - Number of consecutive days.
 * @returns {string} Streak description.
 */
export function formatStreak(days) {
  if (days <= 0) return 'No streak';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''}, ${days % 7} day${days % 7 !== 1 ? 's' : ''}`;
  }
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''}, ${days % 30} day${days % 30 !== 1 ? 's' : ''}`;
}

/**
 * Generate a unique ID for entities.
 * @returns {string} A unique identifier string.
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
