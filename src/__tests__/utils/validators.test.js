/**
 * @fileoverview Unit tests for input validation utilities.
 * Tests all validators with valid, invalid, and edge case inputs.
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeInput,
  validateNumber,
  validateEmail,
  validateProfile,
  validateActivityEntry,
  validateGoal,
} from '../../utils/validators.js';

describe('sanitizeInput', () => {
  it('should return empty string for non-string input', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(42)).toBe('');
    expect(sanitizeInput({})).toBe('');
  });

  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('should strip HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('');
    expect(sanitizeInput('<b>bold</b>')).toBe('bold');
    expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('');
  });

  it('should preserve safe text', () => {
    expect(sanitizeInput('Hello World 123')).toBe('Hello World 123');
    expect(sanitizeInput('test@email.com')).toBe('test@email.com');
  });

  it('should handle empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });
});

describe('validateNumber', () => {
  it('should validate positive numbers', () => {
    const result = validateNumber(42);
    expect(result.valid).toBe(true);
    expect(result.value).toBe(42);
    expect(result.error).toBeNull();
  });

  it('should reject empty values', () => {
    expect(validateNumber('').valid).toBe(false);
    expect(validateNumber(null).valid).toBe(false);
    expect(validateNumber(undefined).valid).toBe(false);
  });

  it('should reject non-numeric strings', () => {
    const result = validateNumber('abc');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('valid number');
  });

  it('should reject Infinity', () => {
    expect(validateNumber(Infinity).valid).toBe(false);
  });

  it('should reject NaN', () => {
    expect(validateNumber(NaN).valid).toBe(false);
  });

  it('should enforce minimum value', () => {
    const result = validateNumber(-5, { min: 0 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at least 0');
  });

  it('should enforce maximum value', () => {
    const result = validateNumber(200, { max: 100 });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('at most 100');
  });

  it('should handle allowZero option', () => {
    const result = validateNumber(0, { allowZero: false });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('zero');
  });

  it('should accept zero by default', () => {
    expect(validateNumber(0).valid).toBe(true);
  });

  it('should parse string numbers', () => {
    const result = validateNumber('42.5');
    expect(result.valid).toBe(true);
    expect(result.value).toBe(42.5);
  });
});

describe('validateEmail', () => {
  it('should validate correct emails', () => {
    expect(validateEmail('user@example.com').valid).toBe(true);
    expect(validateEmail('test.name@domain.co.in').valid).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('notanemail').valid).toBe(false);
    expect(validateEmail('missing@').valid).toBe(false);
    expect(validateEmail('@nodomain.com').valid).toBe(false);
    expect(validateEmail('').valid).toBe(false);
  });

  it('should reject non-string inputs', () => {
    expect(validateEmail(null).valid).toBe(false);
    expect(validateEmail(undefined).valid).toBe(false);
  });
});

describe('validateProfile', () => {
  it('should validate valid profile', () => {
    const result = validateProfile({ name: 'John', householdSize: 4 });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject null profile', () => {
    const result = validateProfile(null);
    expect(result.valid).toBe(false);
  });

  it('should reject excessive household size', () => {
    const result = validateProfile({ householdSize: 100 });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid name length', () => {
    const resultLong = validateProfile({ name: 'a'.repeat(101) });
    expect(resultLong.valid).toBe(false);
    expect(resultLong.errors.length).toBeGreaterThan(0);

    const resultShort = validateProfile({ name: '   ' });
    expect(resultShort.valid).toBe(false);
    expect(resultShort.errors.length).toBeGreaterThan(0);
  });
});

describe('validateActivityEntry', () => {
  it('should validate correct activity entry', () => {
    const entry = {
      category: 'transport',
      type: 'car_gasoline',
      value: 50,
      date: new Date().toISOString(),
    };
    const result = validateActivityEntry(entry);
    expect(result.valid).toBe(true);
  });

  it('should reject missing category', () => {
    const result = validateActivityEntry({ type: 'test', value: 10 });
    expect(result.valid).toBe(false);
  });

  it('should reject missing type', () => {
    const result = validateActivityEntry({ category: 'transport', value: 10 });
    expect(result.valid).toBe(false);
  });

  it('should reject null entry', () => {
    expect(validateActivityEntry(null).valid).toBe(false);
  });

  it('should reject future dates', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const result = validateActivityEntry({
      category: 'transport',
      type: 'car',
      date: future.toISOString(),
    });
    expect(result.valid).toBe(false);
  });

  it('should reject excessively large values', () => {
    const result = validateActivityEntry({
      category: 'transport',
      type: 'car',
      value: 999999,
    });
    expect(result.valid).toBe(false);
  });

  it('should reject invalid date format', () => {
    const result = validateActivityEntry({
      category: 'transport',
      type: 'car',
      date: 'invalid-date-string',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid date format');
  });
});

describe('validateGoal', () => {
  it('should validate correct goal', () => {
    const future = new Date();
    future.setMonth(future.getMonth() + 6);
    const result = validateGoal({
      targetReduction: 20,
      deadline: future.toISOString(),
    });
    expect(result.valid).toBe(true);
  });

  it('should reject missing target', () => {
    const result = validateGoal({});
    expect(result.valid).toBe(false);
  });

  it('should reject target over 100%', () => {
    const result = validateGoal({ targetReduction: 150 });
    expect(result.valid).toBe(false);
  });

  it('should reject past deadline', () => {
    const past = new Date('2020-01-01');
    const result = validateGoal({
      targetReduction: 20,
      deadline: past.toISOString(),
    });
    expect(result.valid).toBe(false);
  });

  it('should reject invalid deadline format', () => {
    const result = validateGoal({
      targetReduction: 20,
      deadline: 'invalid-date-string',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid deadline date');
  });

  it('should reject null goal', () => {
    expect(validateGoal(null).valid).toBe(false);
  });
});
