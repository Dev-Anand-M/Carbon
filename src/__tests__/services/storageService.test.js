/**
 * @fileoverview Unit tests for the storage service.
 * Tests localStorage abstraction with mocking.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getStoredData,
  setStoredData,
  removeStoredData,
  clearAllData,
  getStorageSize,
  exportAllData,
  importData,
} from '../../services/storageService.js';
import { STORAGE_KEYS } from '../../utils/constants.js';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setStoredData', () => {
    it('should store data with version wrapper', () => {
      const result = setStoredData(STORAGE_KEYS.CARBON_DATA, { test: true });
      expect(result).toBe(true);

      const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.CARBON_DATA));
      expect(raw._carbonwise_v).toBe(1);
      expect(raw.data).toEqual({ test: true });
      expect(raw.timestamp).toBeDefined();
    });

    it('should reject unknown keys', () => {
      const result = setStoredData('unknown_key', { data: true });
      expect(result).toBe(false);
    });

    it('should handle arrays', () => {
      const result = setStoredData(STORAGE_KEYS.ACTIVITIES, [1, 2, 3]);
      expect(result).toBe(true);
    });

    it('should handle null values', () => {
      const result = setStoredData(STORAGE_KEYS.GOALS, null);
      expect(result).toBe(true);
    });
  });

  describe('getStoredData', () => {
    it('should return stored data', () => {
      setStoredData(STORAGE_KEYS.CARBON_DATA, { hello: 'world' });
      const result = getStoredData(STORAGE_KEYS.CARBON_DATA);
      expect(result).toEqual({ hello: 'world' });
    });

    it('should return default for missing keys', () => {
      const result = getStoredData(STORAGE_KEYS.CARBON_DATA, 'default');
      expect(result).toBe('default');
    });

    it('should return default for unknown keys', () => {
      const result = getStoredData('unknown_key', 'fallback');
      expect(result).toBe('fallback');
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem(STORAGE_KEYS.CARBON_DATA, 'not-json');
      const result = getStoredData(STORAGE_KEYS.CARBON_DATA, 'default');
      expect(result).toBe('default');
    });
  });

  describe('removeStoredData', () => {
    it('should remove stored data', () => {
      setStoredData(STORAGE_KEYS.ACTIVITIES, [1]);
      removeStoredData(STORAGE_KEYS.ACTIVITIES);
      expect(getStoredData(STORAGE_KEYS.ACTIVITIES)).toBeNull();
    });

    it('should reject unknown keys', () => {
      expect(removeStoredData('bad_key')).toBe(false);
    });
  });

  describe('clearAllData', () => {
    it('should clear all carbonwise keys', () => {
      setStoredData(STORAGE_KEYS.CARBON_DATA, { test: true });
      setStoredData(STORAGE_KEYS.ACTIVITIES, [1, 2, 3]);
      clearAllData();
      expect(getStoredData(STORAGE_KEYS.CARBON_DATA)).toBeNull();
      expect(getStoredData(STORAGE_KEYS.ACTIVITIES)).toBeNull();
    });
  });

  describe('getStorageSize', () => {
    it('should return 0 for empty storage', () => {
      expect(getStorageSize()).toBe(0);
    });

    it('should return positive value after storing data', () => {
      setStoredData(STORAGE_KEYS.CARBON_DATA, { test: 'data' });
      expect(getStorageSize()).toBeGreaterThan(0);
    });
  });

  describe('exportAllData', () => {
    it('should export all stored data', () => {
      setStoredData(STORAGE_KEYS.CARBON_DATA, { foo: 'bar' });
      const exported = exportAllData();
      expect(exported.version).toBe(1);
      expect(exported.exportedAt).toBeDefined();
      expect(exported.data.CARBON_DATA).toEqual({ foo: 'bar' });
    });
  });

  describe('importData', () => {
    it('should successfully import valid backup data', () => {
      const backup = {
        version: 1,
        data: {
          CARBON_DATA: { testImport: true },
          ACTIVITIES: [1, 2, 3],
        },
      };
      const result = importData(backup);
      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);

      expect(getStoredData(STORAGE_KEYS.CARBON_DATA)).toEqual({ testImport: true });
      expect(getStoredData(STORAGE_KEYS.ACTIVITIES)).toEqual([1, 2, 3]);
    });

    it('should reject invalid backup formats', () => {
      expect(importData(null).success).toBe(false);
      expect(importData({}).success).toBe(false);
      expect(importData('invalid').success).toBe(false);
    });

    it('should skip unknown storage keys or null values', () => {
      const backup = {
        version: 1,
        data: {
          UNKNOWN_KEY: { foo: 'bar' },
          CARBON_DATA: null,
        },
      };
      const result = importData(backup);
      expect(result.success).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle legacy data without version wrapper', () => {
      /* Legacy data stored directly (no _carbonwise_v wrapper) */
      localStorage.setItem(STORAGE_KEYS.CARBON_DATA, JSON.stringify({ legacy: true }));
      const result = getStoredData(STORAGE_KEYS.CARBON_DATA);
      expect(result).toEqual({ legacy: true });
    });

    it('should handle versioned data wrapper correctly', () => {
      const wrapped = { _carbonwise_v: 1, timestamp: Date.now(), data: { versioned: true } };
      localStorage.setItem(STORAGE_KEYS.CARBON_DATA, JSON.stringify(wrapped));
      const result = getStoredData(STORAGE_KEYS.CARBON_DATA);
      expect(result).toEqual({ versioned: true });
    });

    it('should return true from clearAllData', () => {
      setStoredData(STORAGE_KEYS.CARBON_DATA, { test: true });
      const result = clearAllData();
      expect(result).toBe(true);
    });

    it('getStorageSize should sum across multiple keys', () => {
      setStoredData(STORAGE_KEYS.CARBON_DATA, { key1: 'value1' });
      setStoredData(STORAGE_KEYS.ACTIVITIES, [1, 2, 3, 4, 5]);
      const size = getStorageSize();
      expect(size).toBeGreaterThan(50);
    });

    it('exportAllData should include all storage key names', () => {
      const exported = exportAllData();
      const keys = Object.keys(exported.data);
      expect(keys).toContain('CARBON_DATA');
      expect(keys).toContain('ACTIVITIES');
      expect(keys).toContain('GOALS');
      expect(keys).toContain('ACHIEVEMENTS');
      expect(keys).toContain('THEME');
    });

    it('importData should handle backup with all valid keys', () => {
      const backup = {
        version: 1,
        data: {
          CARBON_DATA: { transport: {}, energy: {} },
          ACTIVITIES: [],
          GOALS: { targetReduction: 20 },
          COMPLETED_ACTIONS: ['switch_led'],
          ACHIEVEMENTS: ['first_calc'],
        },
      };
      const result = importData(backup);
      expect(result.success).toBe(true);
      expect(getStoredData(STORAGE_KEYS.GOALS)).toEqual({ targetReduction: 20 });
      expect(getStoredData(STORAGE_KEYS.COMPLETED_ACTIONS)).toEqual(['switch_led']);
    });

    it('removeStoredData should return true for valid keys', () => {
      setStoredData(STORAGE_KEYS.THEME, 'dark');
      expect(removeStoredData(STORAGE_KEYS.THEME)).toBe(true);
      expect(getStoredData(STORAGE_KEYS.THEME)).toBeNull();
    });

    it('setStoredData should handle empty objects', () => {
      expect(setStoredData(STORAGE_KEYS.CARBON_DATA, {})).toBe(true);
      expect(getStoredData(STORAGE_KEYS.CARBON_DATA)).toEqual({});
    });

    it('setStoredData should handle empty arrays', () => {
      expect(setStoredData(STORAGE_KEYS.ACTIVITIES, [])).toBe(true);
      expect(getStoredData(STORAGE_KEYS.ACTIVITIES)).toEqual([]);
    });
  });
});
