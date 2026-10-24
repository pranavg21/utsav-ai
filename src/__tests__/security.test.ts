/**
 * @fileoverview Unit tests for security sanitization, bounds validation, and rate limiting.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeUserText,
  validateNumericBound,
  checkRateLimit,
  resetRateLimit,
} from '../utils/security';

describe('security - sanitizeUserText', () => {
  it('should strip script tags from input', () => {
    const input = 'Hello <script>alert("xss")</script> World';
    const result = sanitizeUserText(input);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
    expect(result).toContain('Hello');
    expect(result).toContain('World');
  });

  it('should strip all HTML tags', () => {
    const input = '<b>Bold</b> and <a href="evil.com">Link</a>';
    const result = sanitizeUserText(input);
    expect(result).not.toContain('<b>');
    expect(result).not.toContain('<a');
    expect(result).toContain('Bold');
    expect(result).toContain('Link');
  });

  it('should strip control characters', () => {
    const input = 'Hello\x00\x01\x02World';
    const result = sanitizeUserText(input);
    expect(result).toBe('HelloWorld');
  });

  it('should truncate input to maxLength', () => {
    const input = 'A'.repeat(3000);
    const result = sanitizeUserText(input, 100);
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('should trim whitespace from result', () => {
    const result = sanitizeUserText('  hello world  ');
    expect(result).toBe('hello world');
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
