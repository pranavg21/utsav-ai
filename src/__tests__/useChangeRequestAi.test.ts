/**
 * @fileoverview Tests for useChangeRequestAi hook with Gemini AI call and deterministic fallback.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as client from '../services/gemini/client';
import type * as ClientModule from '../services/gemini/client';
import { useChangeRequestAi } from '../hooks/useChangeRequestAi';
import { WEDDING_PRESET } from '../data/presets';
import { clearCache } from '../utils/cache';

vi.mock('../services/gemini/client', async (importOriginal) => {
  const actual = await importOriginal<typeof ClientModule>();
  return {
    ...actual,
    executeStructuredGeminiCall: vi.fn(),
  };
});

describe('useChangeRequestAi hook (10.2)', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });

  it('dispatches Gemini deltas and sets provenance on AI success', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: true,
      data: {
        changeType: 'guest_count',
        guestDelta: 60,
        amountDelta: -50000,
        targetDaysDelta: 7,
        sentiment: 0.2,
        reasoning: 'Added 60 guests and cut 50k budget',
      },
      model: 'gemini-3.8-flash',
    });

    const onApply = vi.fn();
    const { result } = renderHook(() => useChangeRequestAi());

    await act(async () => {
      await result.current.applyChangeAi(WEDDING_PRESET, '60 more guests', onApply);
    });

    expect(result.current.lastProvenance?.source).toBe('gemini');
    const prov = result.current.lastProvenance;
    expect(prov && 'model' in prov ? prov.model : '').toBe('gemini-3.8-flash');
    expect(result.current.lastResponseJson).toContain('Added 60 guests');
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        rawPrompt: '60 more guests',
        guestDelta: 60,
      })
    );
  });

  it('falls back to deterministic values and reports reason on failure', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: false,
      reason: 'offline',
    });

    const onApply = vi.fn();
    const { result } = renderHook(() => useChangeRequestAi());

    await act(async () => {
      await result.current.applyChangeAi(WEDDING_PRESET, '50 more guests', onApply);
    });

    expect(result.current.lastProvenance?.source).toBe('deterministic');
    const prov = result.current.lastProvenance;
    expect(prov && 'reason' in prov ? prov.reason : '').toBe('offline');
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        rawPrompt: '50 more guests',
        guestDelta: 50,
      })
    );
  });
});
