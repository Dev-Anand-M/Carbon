/**
 * @fileoverview Unit tests for the insights engine.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  generateInsights,
  calculateCompletedImpact,
  getContextualTip,
} from '../../services/insightsEngine.js';

describe('generateInsights', () => {
  const sampleData = {
    transport: {
      car_gasoline: { distance: 30, frequency: 1, isWeekly: true },
    },
    energy: { electricity: 300 },
    diet: 'medium_meat',
    shopping: { clothing: 2 },
    waste: { general: 5 },
  };

  it('should generate insights from valid data', () => {
    const result = generateInsights(sampleData, []);
    expect(result).toBeDefined();
    expect(result.footprint).toBeDefined();
    expect(result.recommendations).toBeDefined();
    expect(result.summary).toBeDefined();
  });

  it('should include sorted categories', () => {
    const result = generateInsights(sampleData, []);
    expect(result.sortedCategories.length).toBeGreaterThan(0);
    /* Verify sorted in descending order */
    for (let i = 1; i < result.sortedCategories.length; i++) {
      expect(result.sortedCategories[i - 1].value)
        .toBeGreaterThanOrEqual(result.sortedCategories[i].value);
    }
  });

  it('should filter completed actions from recommendations', () => {
    const result2 = generateInsights(sampleData, ['switch_led', 'public_transport']);
    /* Completed actions should not appear in recommendations */
    const recommendedIds = result2.recommendations.map((r) => r.id);
    expect(recommendedIds).not.toContain('switch_led');
    expect(recommendedIds).not.toContain('public_transport');
  });

  it('should include benchmark comparison', () => {
    const result = generateInsights(sampleData, []);
    expect(result.benchmarks.length).toBeGreaterThan(0);
  });

  it('should calculate potential savings', () => {
    const result = generateInsights(sampleData, []);
    expect(result.potentialSavings).toBeGreaterThan(0);
  });

  it('should provide appropriate summary level', () => {
    const result = generateInsights(sampleData, []);
    expect(['excellent', 'good', 'average', 'high']).toContain(result.summary.level);
    expect(result.summary.message).toBeTruthy();
    expect(result.summary.emoji).toBeTruthy();
  });
});

describe('calculateCompletedImpact', () => {
  it('should calculate impact for completed actions', () => {
    const result = calculateCompletedImpact(['switch_led', 'recycle']);
    expect(result.totalImpact).toBeGreaterThan(0);
    expect(result.completedCount).toBe(2);
  });

  it('should return zero for empty list', () => {
    const result = calculateCompletedImpact([]);
    expect(result.totalImpact).toBe(0);
    expect(result.completedCount).toBe(0);
  });

  it('should include category breakdown', () => {
    const result = calculateCompletedImpact(['switch_led', 'public_transport']);
    expect(result.byCategory).toBeDefined();
    expect(result.byCategory.energy).toBeGreaterThan(0);
    expect(result.byCategory.transport).toBeGreaterThan(0);
  });

  it('should include equivalencies', () => {
    const result = calculateCompletedImpact(['switch_led']);
    expect(result.equivalencies).toBeDefined();
    expect(result.equivalencies.treesNeeded).toBeGreaterThan(0);
  });
});

describe('getContextualTip', () => {
  it('should always return a tip', () => {
    const tip = getContextualTip();
    expect(tip).toBeDefined();
    expect(tip.icon).toBeTruthy();
    expect(tip.title).toBeTruthy();
    expect(tip.text).toBeTruthy();
  });

  it('should return an object with expected shape', () => {
    const tip = getContextualTip();
    expect(typeof tip.icon).toBe('string');
    expect(typeof tip.title).toBe('string');
    expect(typeof tip.text).toBe('string');
  });
});

describe('getContextualTip time and season mocking', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return morning tip for morning hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 7, 0, 0));
    const tip = getContextualTip();
    expect(tip.title).toBe('Morning Commute');
  });

  it('should return lunch tip for midday hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 12, 0, 0));
    const tip = getContextualTip();
    expect(tip.title).toBe('Lunch Time');
  });

  it('should return evening tip for evening hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 18, 0, 0));
    const tip = getContextualTip();
    expect(tip.title).toBe('Evening Energy');
  });

  it('should return night tip for late hours', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 20, 21, 0, 0));
    const tip = getContextualTip();
    expect(tip.title).toBe('Night Routine');
  });

  it('should return winter tip in winter months', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 20, 14, 0, 0));
    const tip = getContextualTip();
    expect(tip.title).toBe('Winter Tip');
  });

  it('should return summer tip in summer months', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 20, 14, 0, 0));
    const tip = getContextualTip();
    expect(tip.title).toBe('Summer Tip');
  });

  it('should return default tip when no time/season match', () => {
    vi.useFakeTimers();
    /* 3 AM in September — no time or season tips match */
    vi.setSystemTime(new Date(2026, 8, 20, 3, 0, 0));
    const tip = getContextualTip();
    expect(tip.title).toBe('Daily Tip');
  });
});

describe('generateInsights summary levels', () => {
  it('should return "excellent" for very low footprint', () => {
    /* Minimal data → total below sustainable_target (2.0 tonnes) */
    const lowData = {
      transport: {},
      energy: {},
      diet: 'vegan',
      shopping: {},
      waste: {},
    };
    const result = generateInsights(lowData, []);
    expect(result.summary.level).toBe('excellent');
    expect(result.summary.emoji).toBe('🌟');
  });

  it('should return "high" for above-world-average footprint', () => {
    /* High emissions across all categories */
    const highData = {
      transport: {
        car_gasoline: { distance: 200, frequency: 1, isWeekly: true },
      },
      energy: { electricity: 1000, natural_gas: 500 },
      diet: 'heavy_meat',
      shopping: { clothing: 10, electronics: 5 },
      waste: { general: 20 },
    };
    const result = generateInsights(highData, []);
    expect(result.summary.level).toBe('high');
    expect(result.summary.emoji).toBe('⚠️');
  });

  it('should handle all actions completed', () => {
    const sampleData = {
      transport: { car_gasoline: { distance: 30, frequency: 1, isWeekly: true } },
      energy: { electricity: 300 },
      diet: 'medium_meat',
      shopping: { clothing: 2 },
      waste: { general: 5 },
    };
    const allActionIds = [
      'switch_led', 'public_transport', 'reduce_meat', 'carpool',
      'cold_wash', 'plant_based_day', 'unplug_devices', 'recycle',
      'composting', 'solar_panels', 'reduce_flights', 'reusable_bags',
    ];
    const result = generateInsights(sampleData, allActionIds);
    expect(result.recommendations).toHaveLength(0);
    expect(result.potentialSavings).toBe(0);
  });
});
