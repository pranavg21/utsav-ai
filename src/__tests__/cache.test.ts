/**
 * @fileoverview Unit tests for LRU caching, TTL expiry, and FNV-1a hashing utilities.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  fnv1aHash,
  buildCompoundCacheKey,
  getCachedResponse,
  setCachedResponse,
  clearCache,
} from '../utils/cache';

describe('cache - fnv1aHash & buildCompoundCacheKey', () => {
  it('produces deterministic hash for identical input', () => {
    const hash1 = fnv1aHash('test-prompt');
    const hash2 = fnv1aHash('test-prompt');
    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^[0-9a-f]{8}$/);
  });

  it('builds compound cache keys across sorted parameters', () => {
    const key1 = buildCompoundCacheKey({ occasion: 'wedding', budget: 500000 });
    const key2 = buildCompoundCacheKey({ budget: 500000, occasion: 'wedding' });
    expect(key1).toBe(key2);
  });
});

describe('cache - getCachedResponse / setCachedResponse', () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  it('returns null for cache miss and handles cache hits', () => {
    expect(getCachedResponse('nonexistent-key')).toBeNull();
    const data = { foo: 'bar', count: 42 };
    setCachedResponse('test-key', data);
    expect(getCachedResponse<typeof data>('test-key')).toEqual(data);
  });

  it('evicts oldest entries when exceeding max capacity', () => {
    for (let i = 0; i < 5; i++) {
      setCachedResponse(`key-${i}`, { value: i }, 3);
    }
    expect(getCachedResponse('key-0')).toBeNull();
    expect(getCachedResponse('key-1')).toBeNull();
    expect(getCachedResponse('key-4')).toEqual({ value: 4 });
  });

  it('invalidates cache entries on TTL expiry (24h)', () => {
    setCachedResponse('ttl-key', { secret: 'data' });
    expect(getCachedResponse('ttl-key')).toEqual({ secret: 'data' });

    // Advance clock by 25 hours
    const future = Date.now() + 25 * 60 * 60 * 1000;
    vi.spyOn(Date, 'now').mockReturnValue(future);
    expect(getCachedResponse('ttl-key')).toBeNull();
  });

  it('clears all entries on clearCache', () => {
    setCachedResponse('key-1', { v: 1 });
    clearCache();
    expect(getCachedResponse('key-1')).toBeNull();
  });
});
