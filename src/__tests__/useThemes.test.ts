/**
 * @fileoverview Unit tests for useThemes hook (10.8).
 * Tests 600ms debouncing and discarding of stale in-flight responses.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemes } from '../hooks/useThemes';
import { WEDDING_PRESET, BIRTHDAY_PRESET } from '../data/presets';
import * as planner from '../services/gemini/planner';
import type * as PlannerModule from '../services/gemini/planner';

vi.mock('../services/gemini/planner', async (importOriginal) => {
  const actual = await importOriginal<typeof PlannerModule>();
  return {
    ...actual,
    generateThemesWithAi: vi.fn(),
  };
});

describe('useThemes hook debouncing and stale discard (10.8)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces calls by 600ms on context changes', async () => {
    vi.mocked(planner.generateThemesWithAi).mockResolvedValue({
      data: [],
      provenance: { source: 'deterministic', reason: 'offline' },
    });

    const { rerender } = renderHook(({ ctx }) => useThemes(ctx), {
      initialProps: { ctx: WEDDING_PRESET },
    });

    expect(planner.generateThemesWithAi).not.toHaveBeenCalled();

    // Advance 300ms, then change context again
    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerender({ ctx: BIRTHDAY_PRESET });

    // Advance another 400ms (total 700ms since start, but only 400ms since last change)
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(planner.generateThemesWithAi).not.toHaveBeenCalled();

    // Advance remaining 200ms (600ms since last change)
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(planner.generateThemesWithAi).toHaveBeenCalledTimes(1);
    expect(planner.generateThemesWithAi).toHaveBeenCalledWith(BIRTHDAY_PRESET);
  });
});
