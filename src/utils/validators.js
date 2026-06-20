/**
 * @fileoverview Input validation and sanitization utilities.
 * Provides defence-in-depth against XSS, injection, and invalid data.
 * @module utils/validators
 */

import DOMPurify from 'dompurify';

/**
 * Sanitise a string to prevent XSS attacks.
 * @param {string} input - The raw user input string.
 * @returns {string} Sanitised string safe for rendering.
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
}

/**
 * Validate that a value is a finite, non-negative number.
 * @param {*} value - The value to validate.
 * @param {Object} [options] - Validation options.
 * @param {number} [options.min=0] - Minimum allowed value.
 * @param {number} [options.max=Infinity] - Maximum allowed value.
 * @param {boolean} [options.allowZero=true] - Whether zero is allowed.
 * @returns {{ valid: boolean, error: string|null, value: number }} Validation result.
 */
export function validateNumber(value, options = {}) {
  const { min = 0, max = Infinity, allowZero = true } = options;
  const num = Number(value);

  if (value === '' || value === null || value === undefined) {
    return { valid: false, error: 'Value is required', value: 0 };
  }

  if (!Number.isFinite(num)) {
    return { valid: false, error: 'Please enter a valid number', value: 0 };
  }

  if (!allowZero && num === 0) {
    return { valid: false, error: 'Value cannot be zero', value: 0 };
  }

  if (num < min) {
    return { valid: false, error: `Value must be at least ${min}`, value: num };
  }

  if (num > max) {
    return { valid: false, error: `Value must be at most ${max}`, value: num };
  }

  return { valid: true, error: null, value: num };
}

/**
 * Validate an email address format.
 * @param {string} email - Email string to validate.
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  const sanitised = sanitizeInput(email);
  /* RFC 5322 simplified pattern */
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!pattern.test(sanitised)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true, error: null };
}

/**
 * Validate a user profile object.
 * @param {Object} profile - Profile data to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProfile(profile) {
  const errors = [];

  if (!profile || typeof profile !== 'object') {
    return { valid: false, errors: ['Invalid profile data'] };
  }

  if (profile.name) {
    const sanitisedName = sanitizeInput(profile.name);
    if (sanitisedName.length < 1 || sanitisedName.length > 100) {
      errors.push('Name must be between 1 and 100 characters');
    }
  }

  if (profile.householdSize) {
    const { valid, error } = validateNumber(profile.householdSize, { min: 1, max: 20 });
    if (!valid) errors.push(`Household size: ${error}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate an activity log entry.
 * @param {Object} entry - Activity entry to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateActivityEntry(entry) {
  const errors = [];

  if (!entry || typeof entry !== 'object') {
    return { valid: false, errors: ['Invalid activity entry'] };
  }

  if (!entry.category || typeof entry.category !== 'string') {
    errors.push('Category is required');
  }

  if (!entry.type || typeof entry.type !== 'string') {
    errors.push('Activity type is required');
  }

  if (entry.value !== undefined) {
    const { valid, error } = validateNumber(entry.value, { min: 0, max: 100000 });
    if (!valid) errors.push(`Value: ${error}`);
  }

  if (entry.date) {
    const date = new Date(entry.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
    /* Prevent future dates */
    if (date > new Date()) {
      errors.push('Date cannot be in the future');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a goal object.
 * @param {Object} goal - Goal data to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateGoal(goal) {
  const errors = [];

  if (!goal || typeof goal !== 'object') {
    return { valid: false, errors: ['Invalid goal data'] };
  }

  if (!goal.targetReduction) {
    errors.push('Target reduction is required');
  } else {
    const { valid, error } = validateNumber(goal.targetReduction, { min: 1, max: 100 });
    if (!valid) errors.push(`Target reduction: ${error}`);
  }

  if (goal.deadline) {
    const deadline = new Date(goal.deadline);
    if (isNaN(deadline.getTime())) {
      errors.push('Invalid deadline date');
    }
    if (deadline < new Date()) {
      errors.push('Deadline must be in the future');
    }
  }

  return { valid: errors.length === 0, errors };
}
