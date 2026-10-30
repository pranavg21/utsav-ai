/**
 * @fileoverview Security utilities for input sanitization, numeric validation, and client-side rate limiting.
 * Protects against XSS injection, invalid numeric ranges, and excessive API call rates.
 */

/** Regex pattern to match HTML script tags and their contents. */
const SCRIPT_TAG_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;

/** Regex pattern to match all HTML tags. */
const HTML_TAG_PATTERN = /<[^>]*>/g;

/** Regex pattern to match ASCII control characters (except newline and tab). */
const CONTROL_CHAR_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/** Regex pattern to match Unicode bidi overrides (RLO/LRO) and zero-width characters. */
const BIDI_AND_ZERO_WIDTH_PATTERN = /[\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]/g;

/** Default maximum input length to prevent oversized payloads. */
const DEFAULT_MAX_LENGTH = 2000;

/** Default rate limit threshold per minute. */
const DEFAULT_MAX_CALLS_PER_MINUTE = 10;

/** Sliding window duration in milliseconds (1 minute). */
const SLIDING_WINDOW_MS = 60_000;

/** In-memory store for rate limiter timestamps keyed by action. */
const rateLimitStore = new Map<string, number[]>();

/**
 * Strips script tags, HTML tags, control chars, bidi overrides, and zero-width chars with NFKC normalization.
 *
 * @param input - Raw user-provided text string.
 * @param maxLength - Maximum allowed string length (defaults to 2000).
 * @returns Sanitized plain-text string safe for processing.
 */
export function sanitizeUserText(input: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  const normalized = input.normalize('NFKC').slice(0, maxLength);
  return normalized
    .replace(SCRIPT_TAG_PATTERN, '')
    .replace(HTML_TAG_PATTERN, '')
    .replace(CONTROL_CHAR_PATTERN, '')
    .replace(BIDI_AND_ZERO_WIDTH_PATTERN, '')
    .trim();
}

/**
 * Clamps a numeric value to within a specified min/max range.
 *
 * @param val - The input numeric value.
 * @param min - Minimum allowed value (inclusive).
 * @param max - Maximum allowed value (inclusive).
 * @returns The clamped value guaranteed to be within [min, max].
 */
export function validateNumericBound(val: number, min: number, max: number): number {
  if (Number.isNaN(val)) {
    return min;
  }
  return Math.min(Math.max(val, min), max);
}

/**
 * Client-side sliding-window rate limiter. Returns true if the action is within
 * the allowed call threshold, false if rate limit is exceeded.
 *
 * @param actionKey - Unique identifier for the rate-limited action.
 * @param maxCallsPerMinute - Maximum calls allowed within one sliding minute window.
 * @returns True if the call is permitted, false if rate-limited.
 */
export function checkRateLimit(
  actionKey: string,
  maxCallsPerMinute: number = DEFAULT_MAX_CALLS_PER_MINUTE
): boolean {
  const now = Date.now();
  const windowStart = now - SLIDING_WINDOW_MS;
  const existing = rateLimitStore.get(actionKey) ?? [];
  const filtered = existing.filter((ts) => ts > windowStart);

  if (filtered.length >= maxCallsPerMinute) {
    rateLimitStore.set(actionKey, filtered);
    return false;
  }

  filtered.push(now);
  rateLimitStore.set(actionKey, filtered);
  return true;
}

/**
 * Resets the rate limiter store for a given action key. Useful for testing.
 *
 * @param actionKey - The action key to reset.
 */
export function resetRateLimit(actionKey: string): void {
  rateLimitStore.delete(actionKey);
}
