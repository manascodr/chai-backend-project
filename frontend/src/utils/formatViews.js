/**
 * Formatting Utilities for VividStream
 * 
 * Provides clean, human-friendly representations of numbers and dates,
 * similar to YouTube and Twitter formatting (e.g. 1.2M views, 3 days ago).
 */

/**
 * Formats subscriber count into compact notation (e.g., 1.5K, 2.3M)
 * @param {number|string} count - The numeric count to format
 * @returns {string} Human-readable formatted string
 */
export const formatSubscriberCount = (count) => {
  const n = Number(count) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return n.toLocaleString();
};

/**
 * Formats video views count (e.g., "1.2K views" or "125 views")
 * @param {number|string} views - The number of views
 * @returns {string} Formatted views string
 */
export const formatViews = (views) => {
  const n = Number(views) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${n} ${n === 1 ? "view" : "views"}`;
};

/**
 * Formats an ISO date into relative time (e.g. "2 hours ago", "3 days ago")
 * @param {string|Date} date - ISO Date string or Date object
 * @returns {string} Relative time string
 */
export const formatTimeAgo = (date) => {
  if (!date) return "";
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

export default {
  formatViews,
  formatSubscriberCount,
  formatTimeAgo,
};

