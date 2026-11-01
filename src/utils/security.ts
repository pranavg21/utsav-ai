/**
 * @fileoverview Security utilities for input sanitization, numeric validation, and client-side rate limiting.
 * Protects against control characters, bidi injection, invalid numeric ranges, and rate abuse.
 */

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
 * Sanitizes user input via NFKC normalization and strips control chars and bidi overrides.
 * Does NOT trim during typing to allow natural space entry.
 *
 * @param input - Raw user-provided text string.
 * @param maxLength - Maximum allowed string length (defaults to 2000).
 * @returns Sanitized string safe for in-memory and UI handling.
 */
export function sanitizeUserText(input: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  const normalized = input.normalize('NFKC').slice(0, maxLength);
  return normalized
    .replace(CONTROL_CHAR_PATTERN, '')
    .replace(BIDI_AND_ZERO_WIDTH_PATTERN, '');
}

/**
 * Finalizes text on blur or submit by trimming extraneous leading/trailing whitespace.
 *
 * @param input - Sanitized text string.
 * @returns Trimmed string.
 */
export function finalizeText(input: string): string {
  return input.trim();
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
 * Evaluates whether an action call exceeds the sliding-window rate limit.
 *
 * @param action - Unique identifier for the rate-limited action.
 * @param maxPerMinute - Maximum allowed calls within the sliding window (default 10).
 * @returns True if the call is allowed; false if rate limit is exceeded.
 */
export function checkRateLimit(
  action: string,
  maxPerMinute: number = DEFAULT_MAX_CALLS_PER_MINUTE
): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(action) ?? [];
  const validTimestamps = timestamps.filter((t) => now - t < SLIDING_WINDOW_MS);

  if (validTimestamps.length >= maxPerMinute) {
    rateLimitStore.set(action, validTimestamps);
    return false;
  }

  validTimestamps.push(now);
  rateLimitStore.set(action, validTimestamps);
  return true;
}

/**
 * Resets rate limit store for a given action key. Used exclusively for testing.
 *
 * @param action - Action key to reset.
 */
export function resetRateLimit(action: string): void {
  rateLimitStore.delete(action);
}
