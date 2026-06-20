/**
 * @fileoverview Tests for constant data integrity.
 * Ensures all emission factor data is valid and consistent.
 */

import { describe, it, expect } from 'vitest';
import {
  TRANSPORT_FACTORS,
  ENERGY_FACTORS,
  DIET_FACTORS,
  SHOPPING_FACTORS,
  WASTE_FACTORS,
  REDUCTION_ACTIONS,
  ACHIEVEMENTS,
  CATEGORIES,
  BENCHMARKS,
  STORAGE_KEYS,
  CHART_COLORS,
  EQUIVALENCIES,
} from '../../utils/constants.js';

describe('Constants Data Integrity', () => {
  describe('TRANSPORT_FACTORS', () => {
    it('should have at least 5 transport modes', () => {
      expect(Object.keys(TRANSPORT_FACTORS).length).toBeGreaterThanOrEqual(5);
    });

    it('should have required properties for each mode', () => {
      Object.values(TRANSPORT_FACTORS).forEach((mode) => {
        expect(mode).toHaveProperty('factor');
        expect(mode).toHaveProperty('unit');
        expect(mode).toHaveProperty('label');
        expect(mode).toHaveProperty('icon');
        expect(typeof mode.factor).toBe('number');
        expect(mode.factor).toBeGreaterThanOrEqual(0);
      });
    });

    it('should be immutable', () => {
      expect(() => {
        TRANSPORT_FACTORS.new_mode = {};
      }).toThrow();
    });
  });

  describe('ENERGY_FACTORS', () => {
    it('should have renewable options with zero emissions', () => {
      expect(ENERGY_FACTORS.solar.factor).toBe(0);
      expect(ENERGY_FACTORS.wind.factor).toBe(0);
    });
  });

  describe('DIET_FACTORS', () => {
    it('should have vegan as lowest emission', () => {
      const values = Object.values(DIET_FACTORS).map((d) => d.factor);
      const minFactor = Math.min(...values);
      expect(DIET_FACTORS.vegan.factor).toBe(minFactor);
    });

    it('should have heavy_meat as highest emission', () => {
      const values = Object.values(DIET_FACTORS).map((d) => d.factor);
      const maxFactor = Math.max(...values);
      expect(DIET_FACTORS.heavy_meat.factor).toBe(maxFactor);
    });
  });

  describe('REDUCTION_ACTIONS', () => {
    it('should have unique IDs', () => {
      const ids = REDUCTION_ACTIONS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have required fields', () => {
      REDUCTION_ACTIONS.forEach((action) => {
        expect(action.id).toBeTruthy();
        expect(action.category).toBeTruthy();
        expect(action.title).toBeTruthy();
        expect(action.impact_kg_per_year).toBeGreaterThan(0);
        expect(['easy', 'medium', 'hard']).toContain(action.difficulty);
      });
    });

    it('should reference valid categories', () => {
      const validCategories = Object.keys(CATEGORIES);
      REDUCTION_ACTIONS.forEach((action) => {
        expect(validCategories).toContain(action.category);
      });
    });
  });

  describe('BENCHMARKS', () => {
    it('should have India average lower than world average', () => {
      expect(BENCHMARKS.india_average).toBeLessThan(BENCHMARKS.world_average);
    });

    it('should have sustainable target', () => {
      expect(BENCHMARKS.sustainable_target).toBeDefined();
      expect(BENCHMARKS.sustainable_target).toBeGreaterThan(0);
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have unique values', () => {
      const values = Object.values(STORAGE_KEYS);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });

    it('should all start with carbonwise_ prefix', () => {
      Object.values(STORAGE_KEYS).forEach((key) => {
        expect(key.startsWith('carbonwise_')).toBe(true);
      });
    });
  });

  describe('CHART_COLORS', () => {
    it('should have at least 5 colors', () => {
      expect(CHART_COLORS.length).toBeGreaterThanOrEqual(5);
    });

    it('should be valid hex colors', () => {
      CHART_COLORS.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });
});
