/**
 * @fileoverview Unit tests for the insights engine.
 */

import { describe, it, expect } from 'vitest';
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
    const result1 = generateInsights(sampleData, []);
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
