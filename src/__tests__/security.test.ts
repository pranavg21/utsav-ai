/**
 * @fileoverview Unit tests for security sanitization, bounds validation, and rate limiting.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeUserText,
  finalizeText,
  validateNumericBound,
  checkRateLimit,
  resetRateLimit,
} from '../utils/security';

describe('security - sanitizeUserText & finalizeText (9.7)', () => {
  it('preserves trailing spaces during typing (e.g. "Grand ")', () => {
    expect(sanitizeUserText('Grand ')).toBe('Grand ');
  });

  it('does not destroy text with comparison operators "budget < 5L and > 3L"', () => {
    expect(sanitizeUserText('budget < 5L and > 3L')).toBe('budget < 5L and > 3L');
  });

  it('preserves raw text for React escaping without regex mangling', () => {
    const input = '<img src=x onerror=alert(1)//';
    expect(sanitizeUserText(input)).toBe(input);
  });

  it('strips ASCII control characters', () => {
    const input = 'Hello\x00\x01\x02World';
    expect(sanitizeUserText(input)).toBe('HelloWorld');
  });

  it('strips zero-width and bidi override characters', () => {
    const input = 'Hello\u200B\u202AWorld';
    expect(sanitizeUserText(input)).toBe('HelloWorld');
  });

  it('truncates input to maxLength', () => {
    const input = 'A'.repeat(3000);
    const result = sanitizeUserText(input, 100);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('finalizeText trims whitespace on blur / submit', () => {
    expect(finalizeText('  Grand Family Wedding  ')).toBe('Grand Family Wedding');
  });
});

describe('security - validateNumericBound', () => {
  it('should clamp values below minimum', () => {
    expect(validateNumericBound(-5, 0, 100)).toBe(0);
  });

  it('should clamp values above maximum', () => {
    expect(validateNumericBound(150, 0, 100)).toBe(100);
  });

  it('should pass through values within range', () => {
    expect(validateNumericBound(50, 0, 100)).toBe(50);
  });

  it('should return min for NaN input', () => {
    expect(validateNumericBound(NaN, 10, 100)).toBe(10);
  });
});

describe('security - checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimit('test-action');
  });

  it('should allow calls within the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('test-action', 10)).toBe(true);
    }
  });

  it('should block calls exceeding the limit', () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit('test-action', 3);
    }
    expect(checkRateLimit('test-action', 3)).toBe(false);
  });
});
