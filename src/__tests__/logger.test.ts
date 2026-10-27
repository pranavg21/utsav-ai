/**
 * @fileoverview Unit tests for structured logger utility.
 * Validates JSON formatting, level tags, timestamp emission, and console dispatch.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../utils/logger';

describe('structured logger utility', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should emit structured info log entry with timestamp', () => {
    logger.info('Engine initialized', { version: '1.0.0' });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(logSpy.mock.calls[0]![0] as string);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('Engine initialized');
    expect(parsed.context.version).toBe('1.0.0');
    expect(new Date(parsed.timestamp).getTime()).not.toBeNaN();
  });

  it('should emit structured warn log entry', () => {
    logger.warn('Rate limit approaching', { count: 8 });

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(warnSpy.mock.calls[0]![0] as string);
    expect(parsed.level).toBe('warn');
    expect(parsed.message).toBe('Rate limit approaching');
  });

  it('should emit structured error log entry', () => {
    logger.error('API call failed', { code: 500 });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(errorSpy.mock.calls[0]![0] as string);
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('API call failed');
  });
});
