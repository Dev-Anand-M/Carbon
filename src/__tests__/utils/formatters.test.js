/**
 * @fileoverview Unit tests for formatter utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatEmissions,
  formatDate,
  formatRelativeTime,
  formatPercentage,
  getEmissionStatus,
  formatStreak,
  generateId,
} from '../../utils/formatters.js';

describe('formatNumber', () => {
  it('should format integers', () => {
    expect(formatNumber(1000)).toContain('1');
    expect(formatNumber(0)).toBe('0');
  });

  it('should handle decimals', () => {
    const result = formatNumber(3.14159, 2);
    expect(result).toContain('3.14');
  });

  it('should handle non-finite values', () => {
    expect(formatNumber(NaN)).toBe('0');
    expect(formatNumber(Infinity)).toBe('0');
  });
});

describe('formatEmissions', () => {
  it('should format small values in kg', () => {
    const result = formatEmissions(500);
    expect(result).toContain('kg');
    expect(result).toContain('500');
  });

  it('should format large values in tonnes', () => {
    const result = formatEmissions(5000);
    expect(result).toContain('tonnes');
  });

  it('should handle short format', () => {
    const short = formatEmissions(500, { short: true });
    expect(short).toContain('kg');
    expect(short).not.toContain('CO₂e');
  });

  it('should handle zero', () => {
    const result = formatEmissions(0);
    expect(result).toContain('0');
  });

  it('should handle negative values', () => {
    const result = formatEmissions(-10);
    expect(result).toContain('0');
  });
});

describe('formatDate', () => {
  it('should format valid dates', () => {
    const result = formatDate('2024-06-15');
    expect(result).toBeTruthy();
    expect(result).not.toBe('Invalid date');
  });

  it('should handle invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
  });

  it('should support different styles', () => {
    const date = '2024-01-15';
    const short = formatDate(date, 'short');
    const long = formatDate(date, 'long');
    expect(long.length).toBeGreaterThan(short.length);
  });
});

describe('formatRelativeTime', () => {
  it('should show "Just now" for recent times', () => {
    expect(formatRelativeTime(new Date())).toBe('Just now');
  });

  it('should show minutes ago', () => {
    const minutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(minutesAgo)).toBe('5 minutes ago');
  });

  it('should show hours ago', () => {
    const hoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(hoursAgo)).toBe('3 hours ago');
  });

  it('should show days ago', () => {
    const daysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(daysAgo)).toBe('4 days ago');
  });

  it('should show formatted date for old dates', () => {
    const oldDate = new Date('2024-01-01');
    expect(formatRelativeTime(oldDate)).toContain('2024');
  });

  it('should handle invalid dates', () => {
    expect(formatRelativeTime('invalid')).toBe('Unknown');
  });
});

describe('formatPercentage', () => {
  it('should format percentage correctly', () => {
    expect(formatPercentage(75.555, 1)).toBe('75.6%');
    expect(formatPercentage(100, 0)).toBe('100%');
  });

  it('should handle NaN', () => {
    expect(formatPercentage(NaN)).toBe('0%');
  });
});

describe('getEmissionStatus', () => {
  it('should return good when below target', () => {
    expect(getEmissionStatus(50, 100)).toBe('good');
  });

  it('should return moderate when slightly above', () => {
    expect(getEmissionStatus(120, 100)).toBe('moderate');
  });

  it('should return poor when well above', () => {
    expect(getEmissionStatus(200, 100)).toBe('poor');
  });
});

describe('formatStreak', () => {
  it('should handle zero days', () => {
    expect(formatStreak(0)).toBe('No streak');
  });

  it('should handle single day', () => {
    expect(formatStreak(1)).toBe('1 day');
  });

  it('should handle multiple days', () => {
    expect(formatStreak(5)).toBe('5 days');
  });

  it('should format weeks', () => {
    const result = formatStreak(10);
    expect(result).toContain('week');
  });

  it('should format months', () => {
    const result = formatStreak(45);
    expect(result).toContain('month');
  });
});

describe('generateId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should return a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('should contain a timestamp', () => {
    const id = generateId();
    const timestampPart = id.split('-')[0];
    expect(Number(timestampPart)).toBeGreaterThan(0);
  });
});
