/**
 * @fileoverview Unit tests for LRU caching and FNV-1a hashing utilities.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  fnv1aHash,
  getCachedResponse,
  setCachedResponse,
  clearCache,
} from '../utils/cache';

describe('cache - fnv1aHash', () => {
  it('should produce deterministic hash for identical input', () => {
    const hash1 = fnv1aHash('test-prompt');
    const hash2 = fnv1aHash('test-prompt');
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different inputs', () => {
    const hash1 = fnv1aHash('prompt-a');
    const hash2 = fnv1aHash('prompt-b');
    expect(hash1).not.toBe(hash2);
  });

  it('should return 8-character hex string', () => {
    const hash = fnv1aHash('hello');
    expect(hash).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe('cache - getCachedResponse / setCachedResponse', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should return null for cache miss', () => {
    const result = getCachedResponse<string>('nonexistent-key');
    expect(result).toBeNull();
  });

  it('should return cached value on hit', () => {
    const data = { foo: 'bar', count: 42 };
    setCachedResponse('test-key', data);
    const result = getCachedResponse<typeof data>('test-key');
    expect(result).toEqual(data);
  });

  it('should evict oldest entries when exceeding max capacity', () => {
    for (let i = 0; i < 5; i++) {
      setCachedResponse(`key-${i}`, { value: i }, 3);
    }
    expect(getCachedResponse('key-0')).toBeNull();
    expect(getCachedResponse('key-1')).toBeNull();
    expect(getCachedResponse('key-4')).toEqual({ value: 4 });
  });

  it('should clear all entries on clearCache', () => {
    setCachedResponse('key-1', { v: 1 });
    clearCache();
    expect(getCachedResponse('key-1')).toBeNull();
  });
});
