/**
 * @fileoverview Unit tests for carbon calculation utilities.
 * Tests cover all calculation functions with edge cases.
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateDietEmissions,
  calculateShoppingEmissions,
  calculateWasteEmissions,
  calculateTotalFootprint,
  calculatePercentages,
  getEquivalencies,
  compareToBenchmarks,
  calculateGoalProgress,
  calculateDailyBudget,
} from '../../utils/carbonCalculations.js';

describe('calculateTransportEmissions', () => {
  it('should calculate gasoline car emissions correctly', () => {
    const result = calculateTransportEmissions('car_gasoline', 100);
    expect(result).toBe(21); // 0.21 * 100
  });

  it('should return 0 for zero-emission transport', () => {
    expect(calculateTransportEmissions('bicycle', 50)).toBe(0);
    expect(calculateTransportEmissions('walking', 100)).toBe(0);
  });

  it('should apply frequency multiplier', () => {
    const result = calculateTransportEmissions('car_gasoline', 10, 5);
    expect(result).toBe(10.5); // 0.21 * 10 * 5
  });

  it('should throw for unknown transport mode', () => {
    expect(() => calculateTransportEmissions('spaceship', 100)).toThrow(
      'Unknown transport mode: spaceship'
    );
  });

  it('should return 0 for negative distance', () => {
    expect(calculateTransportEmissions('car_gasoline', -10)).toBe(0);
  });

  it('should handle decimal values', () => {
    const result = calculateTransportEmissions('bus', 25.5);
    expect(result).toBeCloseTo(2.27, 1);
  });
});

describe('calculateEnergyEmissions', () => {
  it('should calculate electricity emissions', () => {
    const result = calculateEnergyEmissions('electricity', 100);
    expect(result).toBe(41.7); // 0.417 * 100
  });

  it('should return 0 for renewable sources', () => {
    expect(calculateEnergyEmissions('solar', 1000)).toBe(0);
    expect(calculateEnergyEmissions('wind', 500)).toBe(0);
  });

  it('should throw for unknown source', () => {
    expect(() => calculateEnergyEmissions('nuclear', 100)).toThrow(
      'Unknown energy source: nuclear'
    );
  });

  it('should return 0 for negative consumption', () => {
    expect(calculateEnergyEmissions('electricity', -50)).toBe(0);
  });
});

describe('calculateDietEmissions', () => {
  it('should return weekly factor for each diet type', () => {
    expect(calculateDietEmissions('heavy_meat')).toBe(57.2);
    expect(calculateDietEmissions('vegan')).toBe(14.7);
    expect(calculateDietEmissions('vegetarian')).toBe(21.3);
  });

  it('should throw for unknown diet', () => {
    expect(() => calculateDietEmissions('breatharian')).toThrow(
      'Unknown diet type: breatharian'
    );
  });

  it('should show vegan is lower than heavy meat', () => {
    expect(calculateDietEmissions('vegan')).toBeLessThan(
      calculateDietEmissions('heavy_meat')
    );
  });
});

describe('calculateShoppingEmissions', () => {
  it('should calculate clothing emissions', () => {
    const result = calculateShoppingEmissions('clothing', 3);
    expect(result).toBe(75); // 25 * 3
  });

  it('should throw for unknown category', () => {
    expect(() => calculateShoppingEmissions('jewelry', 1)).toThrow(
      'Unknown shopping category: jewelry'
    );
  });

  it('should return 0 for zero quantity', () => {
    expect(calculateShoppingEmissions('clothing', 0)).toBe(0);
  });
});

describe('calculateWasteEmissions', () => {
  it('should calculate general waste emissions', () => {
    const result = calculateWasteEmissions('general', 10);
    expect(result).toBe(5.87); // 0.587 * 10
  });

  it('should show recycled waste is much lower', () => {
    const general = calculateWasteEmissions('general', 10);
    const recycled = calculateWasteEmissions('recycled', 10);
    expect(recycled).toBeLessThan(general);
  });

  it('should throw for unknown waste type', () => {
    expect(() => calculateWasteEmissions('nuclear_waste', 5)).toThrow(
      'Unknown waste type: nuclear_waste'
    );
  });
});

describe('calculateTotalFootprint', () => {
  it('should return zeros for empty data', () => {
    const result = calculateTotalFootprint({});
    expect(result.total).toBe(0);
    expect(result.totalTonnes).toBe(0);
    expect(result.breakdown.transport).toBe(0);
  });

  it('should calculate diet-only footprint correctly', () => {
    const result = calculateTotalFootprint({ diet: 'vegan' });
    expect(result.breakdown.diet).toBeCloseTo(14.7 * 52, 0); // Weekly * 52 weeks
    expect(result.total).toBeGreaterThan(0);
  });

  it('should sum all categories', () => {
    const data = {
      transport: {
        car_gasoline: { distance: 20, frequency: 1, isWeekly: true },
      },
      energy: { electricity: 200 },
      diet: 'medium_meat',
      shopping: { clothing: 2 },
      waste: { general: 5 },
    };
    const result = calculateTotalFootprint(data);
    expect(result.total).toBeGreaterThan(0);
    expect(result.breakdown.transport).toBeGreaterThan(0);
    expect(result.breakdown.energy).toBeGreaterThan(0);
    expect(result.breakdown.diet).toBeGreaterThan(0);
  });

  it('should calculate totalTonnes from total kg', () => {
    const result = calculateTotalFootprint({ diet: 'heavy_meat' });
    expect(result.totalTonnes).toBeCloseTo(result.total / 1000, 1);
  });

  it('should include percentages', () => {
    const result = calculateTotalFootprint({ diet: 'vegan' });
    expect(result.percentages).toBeDefined();
    expect(result.percentages.diet).toBeGreaterThan(0);
  });
});

describe('calculatePercentages', () => {
  it('should calculate correct percentages', () => {
    const breakdown = { a: 25, b: 75 };
    const result = calculatePercentages(breakdown, 100);
    expect(result.a).toBe(25);
    expect(result.b).toBe(75);
  });

  it('should handle zero total', () => {
    const result = calculatePercentages({ a: 0, b: 0 }, 0);
    expect(result.a).toBe(0);
    expect(result.b).toBe(0);
  });
});

describe('getEquivalencies', () => {
  it('should return positive values for positive emissions', () => {
    const result = getEquivalencies(1000);
    expect(result.treesNeeded).toBeGreaterThan(0);
    expect(result.smartphoneCharges).toBeGreaterThan(0);
    expect(result.kmDriven).toBeGreaterThan(0);
  });

  it('should return zeros for zero emissions', () => {
    const result = getEquivalencies(0);
    expect(result.treesNeeded).toBe(0);
    expect(result.smartphoneCharges).toBe(0);
  });

  it('should return zeros for negative emissions', () => {
    const result = getEquivalencies(-100);
    expect(result.treesNeeded).toBe(0);
  });

  it('should scale linearly', () => {
    const result1 = getEquivalencies(1000);
    const result2 = getEquivalencies(2000);
    expect(result2.treesNeeded).toBeCloseTo(result1.treesNeeded * 2, 0);
  });
});

describe('compareToBenchmarks', () => {
  it('should compare user value against all benchmarks', () => {
    const result = compareToBenchmarks(5);
    expect(result.length).toBeGreaterThan(0);
    result.forEach((benchmark) => {
      expect(benchmark).toHaveProperty('key');
      expect(benchmark).toHaveProperty('value');
      expect(benchmark).toHaveProperty('status');
    });
  });

  it('should mark below benchmarks correctly', () => {
    const result = compareToBenchmarks(1);
    const worldAvg = result.find((b) => b.key === 'world_average');
    expect(worldAvg.status).toBe('below');
  });

  it('should mark above benchmarks correctly', () => {
    const result = compareToBenchmarks(20);
    const indiaAvg = result.find((b) => b.key === 'india_average');
    expect(indiaAvg.status).toBe('above');
  });
});

describe('calculateGoalProgress', () => {
  it('should calculate progress correctly', () => {
    const result = calculateGoalProgress(1000, 800, 20);
    expect(result.progress).toBe(100); // Reduced 200 out of target 200
    expect(result.onTrack).toBe(true);
  });

  it('should handle no reduction', () => {
    const result = calculateGoalProgress(1000, 1000, 20);
    expect(result.progress).toBe(0);
    expect(result.onTrack).toBe(false);
  });

  it('should cap at 100%', () => {
    const result = calculateGoalProgress(1000, 500, 20);
    expect(result.progress).toBe(100);
  });

  it('should handle zero baseline', () => {
    const result = calculateGoalProgress(0, 0, 20);
    expect(result.progress).toBe(0);
  });
});

describe('calculateDailyBudget', () => {
  it('should calculate daily budget correctly', () => {
    const result = calculateDailyBudget(3650, 0);
    expect(result).toBe(10); // 3650 / 365
  });

  it('should apply reduction percentage', () => {
    const result = calculateDailyBudget(3650, 50);
    expect(result).toBe(5); // 3650 * 0.5 / 365
  });
});
