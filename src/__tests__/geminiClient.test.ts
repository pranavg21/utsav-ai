/**
 * @fileoverview Unit tests for Gemini client configuration, status, and API execution.
 */
import { describe, it, expect } from 'vitest';
import {
  setRuntimeApiKey,
  getActiveApiKey,
  getGeminiStatus,
  executeGeminiPrompt,
} from '../services/gemini/client';

describe('Gemini client module', () => {
  it('manages runtime api key', () => {
    setRuntimeApiKey('  test-key-123  ');
    expect(getActiveApiKey()).toBe('test-key-123');
    expect(getGeminiStatus()).toBe(false);

    setRuntimeApiKey('');
    expect(getActiveApiKey()).toBe('');
  });

  it('returns null when executing prompt without API key', async () => {
    setRuntimeApiKey('');
    const result = await executeGeminiPrompt('Hello Gemini');
    expect(result).toBeNull();
  });
});
