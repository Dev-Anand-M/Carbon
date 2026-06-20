/**
 * @fileoverview Secure localStorage service with data integrity checks.
 * Provides a safe abstraction over browser localStorage with
 * JSON serialization, error handling, and data validation.
 * @module services/storageService
 */

import { STORAGE_KEYS } from '../utils/constants.js';

/**
 * Safely retrieve and parse data from localStorage.
 * @param {string} key - Storage key from STORAGE_KEYS.
 * @param {*} defaultValue - Fallback value if key doesn't exist or parsing fails.
 * @returns {*} Parsed data or defaultValue.
 */
export function getStoredData(key, defaultValue = null) {
  try {
    /* Validate key is from our known set to prevent arbitrary access */
    if (!Object.values(STORAGE_KEYS).includes(key)) {
      console.warn(`[StorageService] Attempted access with unknown key: ${key}`);
      return defaultValue;
    }

    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;

    const parsed = JSON.parse(raw);

    /* Integrity check: ensure data has expected wrapper */
    if (parsed && typeof parsed === 'object' && parsed._carbonwise_v) {
      return parsed.data;
    }

    /* Legacy data without wrapper — return as-is */
    return parsed;
  } catch (error) {
    console.error(`[StorageService] Failed to read key "${key}":`, error.message);
    return defaultValue;
  }
}

/**
 * Safely serialise and store data in localStorage.
 * @param {string} key - Storage key from STORAGE_KEYS.
 * @param {*} data - Data to store (must be JSON-serialisable).
 * @returns {boolean} True if storage succeeded.
 */
export function setStoredData(key, data) {
  try {
    if (!Object.values(STORAGE_KEYS).includes(key)) {
      console.warn(`[StorageService] Attempted write with unknown key: ${key}`);
      return false;
    }

    /* Wrap data with version marker for integrity */
    const wrapped = {
      _carbonwise_v: 1,
      timestamp: Date.now(),
      data,
    };

    const serialised = JSON.stringify(wrapped);

    /* Check storage quota (5MB typical limit) */
    const sizeInBytes = new Blob([serialised]).size;
    if (sizeInBytes > 4 * 1024 * 1024) {
      console.warn('[StorageService] Data exceeds 4MB safety limit');
      return false;
    }

    localStorage.setItem(key, serialised);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('[StorageService] Storage quota exceeded');
    } else {
      console.error(`[StorageService] Failed to write key "${key}":`, error.message);
    }
    return false;
  }
}

/**
 * Remove a specific key from localStorage.
 * @param {string} key - Storage key to remove.
 * @returns {boolean} True if removal succeeded.
 */
export function removeStoredData(key) {
  try {
    if (!Object.values(STORAGE_KEYS).includes(key)) {
      console.warn(`[StorageService] Attempted removal of unknown key: ${key}`);
      return false;
    }
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[StorageService] Failed to remove key "${key}":`, error.message);
    return false;
  }
}

/**
 * Clear all CarbonWise data from localStorage.
 * Only removes keys belonging to this application.
 * @returns {boolean} True if all removals succeeded.
 */
export function clearAllData() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('[StorageService] Failed to clear data:', error.message);
    return false;
  }
}

/**
 * Get the total storage size used by CarbonWise (in bytes).
 * @returns {number} Total bytes used.
 */
export function getStorageSize() {
  let total = 0;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key);
      if (item) {
        total += new Blob([item]).size;
      }
    });
  } catch (error) {
    console.error('[StorageService] Failed to calculate storage size:', error.message);
  }
  return total;
}

/**
 * Export all user data as a JSON object (for download/backup).
 * @returns {Object} All stored CarbonWise data.
 */
export function exportAllData() {
  const data = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    data[name] = getStoredData(key);
  });
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    data,
  };
}

/**
 * Import data from a previously exported JSON backup.
 * @param {Object} backup - The backup object from exportAllData.
 * @returns {{ success: boolean, errors: string[] }}
 */
export function importData(backup) {
  const errors = [];

  if (!backup || typeof backup !== 'object' || !backup.data) {
    return { success: false, errors: ['Invalid backup format'] };
  }

  Object.entries(backup.data).forEach(([name, value]) => {
    const key = STORAGE_KEYS[name];
    if (key && value !== null) {
      const success = setStoredData(key, value);
      if (!success) {
        errors.push(`Failed to import ${name}`);
      }
    }
  });

  return { success: errors.length === 0, errors };
}
