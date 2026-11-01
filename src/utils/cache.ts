/**
 * @fileoverview Deterministic FNV-1a hash with TTL (24h), schema versioning, and sessionStorage LRU.
 */

import { safeJsonParse } from './typeGuards';

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const DEFAULT_MAX_ENTRIES = 50;
const STORAGE_PREFIX = 'utsav_cache_';

/** Active cache schema version for cache invalidation. */
export const SCHEMA_VERSION = 1;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEnvelope<T> {
  readonly version: number;
  readonly timestamp: number;
  readonly data: T;
}

/**
 * Computes deterministic 32-bit FNV-1a hash hex string of an input text.
 * @param input String to hash.
 * @returns 8-character zero-padded hexadecimal hash string.
 */
export function fnv1aHash(input: string): string {
  let hash = FNV_OFFSET_BASIS;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Generates an order-independent cache key from arbitrary parameter key-value pairs.
 * @param params Key-value pairs to serialize.
 * @returns 8-character FNV-1a hash key.
 */
export function buildCompoundCacheKey(params: Record<string, unknown>): string {
  const sorted = Object.keys(params).sort().map((k) => `${k}:${JSON.stringify(params[k])}`).join('|');
  return fnv1aHash(sorted);
}

const lruOrder: string[] = [];
const memoryCache = new Map<string, string>();

function unpackEnvelope<T>(serialized: string): T | null {
  const envelope = safeJsonParse<CacheEnvelope<T>>(serialized);
  if (!envelope || envelope.version !== SCHEMA_VERSION) return null;
  if (Date.now() - envelope.timestamp > CACHE_TTL_MS) return null;
  return envelope.data;
}

/**
 * Retrieves a cached response by its prompt key from memory or session storage.
 * @param promptKey Raw prompt string or key.
 * @returns Cached data object or null if expired or missing.
 */
export function getCachedResponse<T>(promptKey: string): T | null {
  const hash = fnv1aHash(promptKey);
  const memValue = memoryCache.get(hash);
  if (memValue !== undefined) {
    const data = unpackEnvelope<T>(memValue);
    if (data !== null) {
      promoteLru(hash);
      return data;
    }
  }

  try {
    const stored = sessionStorage.getItem(`${STORAGE_PREFIX}${hash}`);
    if (stored) {
      const data = unpackEnvelope<T>(stored);
      if (data !== null) {
        memoryCache.set(hash, stored);
        promoteLru(hash);
        return data;
      }
    }
  } catch {
    /* sessionStorage blocked */
  }

  return null;
}

/**
 * Saves a response in memory and session storage with LRU eviction.
 * @param promptKey Raw prompt string.
 * @param response Data object to cache.
 * @param maxEntries Maximum number of entries before LRU eviction.
 */
export function setCachedResponse<T>(
  promptKey: string,
  response: T,
  maxEntries: number = DEFAULT_MAX_ENTRIES
): void {
  const hash = fnv1aHash(promptKey);
  const envelope: CacheEnvelope<T> = { version: SCHEMA_VERSION, timestamp: Date.now(), data: response };
  const serialized = JSON.stringify(envelope);

  memoryCache.set(hash, serialized);
  promoteLru(hash);

  while (lruOrder.length > maxEntries) {
    const evicted = lruOrder.shift();
    if (evicted) {
      memoryCache.delete(evicted);
      try {
        sessionStorage.removeItem(`${STORAGE_PREFIX}${evicted}`);
      } catch {
        /* noop */
      }
    }
  }

  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${hash}`, serialized);
  } catch {
    /* noop */
  }
}

/**
 * Clears all cached items from memory and session storage.
 */
export function clearCache(): void {
  for (const key of memoryCache.keys()) {
    try {
      sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch {
      /* noop */
    }
  }
  memoryCache.clear();
  lruOrder.length = 0;
}

function promoteLru(hash: string): void {
  const idx = lruOrder.indexOf(hash);
  if (idx !== -1) lruOrder.splice(idx, 1);
  lruOrder.push(hash);
}
