/**
 * @fileoverview Deterministic FNV-1a hash and in-memory + sessionStorage LRU cache.
 * Prevents duplicate LLM calls for identical prompts by caching structured responses.
 */

import { safeJsonParse } from './typeGuards';

/** FNV-1a 32-bit offset basis. */
const FNV_OFFSET_BASIS = 0x811c9dc5;

/** FNV-1a 32-bit prime. */
const FNV_PRIME = 0x01000193;

/** Default maximum cache entries before LRU eviction. */
const DEFAULT_MAX_ENTRIES = 50;

/** sessionStorage key prefix for persistent cache entries. */
const STORAGE_PREFIX = 'utsav_cache_';

/**
 * Computes a deterministic FNV-1a 32-bit hash of the input string.
 *
 * @param input - The string to hash.
 * @returns Unsigned 32-bit hash as a hexadecimal string.
 */
export function fnv1aHash(input: string): string {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/** Ordered keys for LRU tracking (most recent at end). */
const lruOrder: string[] = [];

/** In-memory cache store. */
const memoryCache = new Map<string, string>();

/**
 * Retrieves a cached response for the given prompt key if it exists.
 *
 * @param promptKey - The raw prompt string to look up.
 * @returns The cached parsed response or null if not found.
 */
export function getCachedResponse<T>(promptKey: string): T | null {
  const hash = fnv1aHash(promptKey);

  const memValue = memoryCache.get(hash);
  if (memValue !== undefined) {
    promoteLru(hash);
    return safeJsonParse<T>(memValue);
  }

  try {
    const stored = sessionStorage.getItem(`${STORAGE_PREFIX}${hash}`);
    if (stored !== null) {
      memoryCache.set(hash, stored);
      promoteLru(hash);
      return safeJsonParse<T>(stored);
    }
  } catch {
    /* sessionStorage unavailable in test/SSR contexts */
  }

  return null;
}

/**
 * Stores a response in the LRU cache (both in-memory and sessionStorage).
 *
 * @param promptKey - The raw prompt string used as cache key.
 * @param response - The response object to cache.
 * @param maxEntries - Maximum cache entries before LRU eviction.
 */
export function setCachedResponse<T>(
  promptKey: string,
  response: T,
  maxEntries: number = DEFAULT_MAX_ENTRIES
): void {
  const hash = fnv1aHash(promptKey);
  const serialized = JSON.stringify(response);

  memoryCache.set(hash, serialized);
  promoteLru(hash);

  while (lruOrder.length > maxEntries) {
    const evicted = lruOrder.shift();
    if (evicted) {
      memoryCache.delete(evicted);
      try { sessionStorage.removeItem(`${STORAGE_PREFIX}${evicted}`); } catch { /* noop */ }
    }
  }

  try { sessionStorage.setItem(`${STORAGE_PREFIX}${hash}`, serialized); } catch { /* noop */ }
}

/**
 * Clears all entries from both in-memory and sessionStorage caches.
 */
export function clearCache(): void {
  for (const key of memoryCache.keys()) {
    try { sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`); } catch { /* noop */ }
  }
  memoryCache.clear();
  lruOrder.length = 0;
}

/**
 * Promotes a hash key to the most-recently-used position in the LRU order.
 *
 * @param hash - The hash key to promote.
 */
function promoteLru(hash: string): void {
  const idx = lruOrder.indexOf(hash);
  if (idx !== -1) {
    lruOrder.splice(idx, 1);
  }
  lruOrder.push(hash);
}
