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
});
