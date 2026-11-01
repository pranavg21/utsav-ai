/**
 * @fileoverview Tests for offline NLP change parser hardening (9.3).
 * Verifies multi-clause parsing, free text deterministic fallback, currency deltas,
 * and vendor delay recognition.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { parseChangeRequest } from '../services/gemini/planner';
import { buildDeterministicChangeResult } from '../services/gemini/fallbacks';
import { WEDDING_PRESET } from '../data/presets';
import { clearCache } from '../utils/cache';

describe('Offline NLP Change Parser Hardening (9.3)', () => {
  beforeEach(() => {
    clearCache();
  });

  it('repro 1: parses "We have 50 more guests and budget dropped 10%" into +50 / -10 / 0', async () => {
    const result = await parseChangeRequest(WEDDING_PRESET, {
      rawPrompt: 'We have 50 more guests and budget dropped 10%',
    });
    expect(result.guestDelta).toBe(50);
    expect(result.budgetDeltaPercent).toBe(-10);
    expect(result.timelineDeltaDays).toBe(0);
  });

  it('repro 2: parses "+50 guests, -10% budget, 2 weeks earlier" into +50 / -10 / 14', async () => {
    const result = await parseChangeRequest(WEDDING_PRESET, {
      rawPrompt: '+50 guests, -10% budget, 2 weeks earlier',
    });
    expect(result.guestDelta).toBe(50);
    expect(result.budgetDeltaPercent).toBe(-10);
    expect(result.timelineDeltaDays).toBe(14);
  });

  it('repro 3: parses "budget 2 lakh kam" into currency delta of -200000', () => {
    const res = buildDeterministicChangeResult(
      { rawPrompt: 'budget 2 lakh kam' },
      WEDDING_PRESET.totalBudget
    );
    expect(res.budgetDeltaCurrency).toBe(-200000);
  });

  it('repro 4: parses "caterer delayed by 5 days" into vendor delay on task-caterer', () => {
    const res = buildDeterministicChangeResult({
      rawPrompt: 'caterer delayed by 5 days',
    });
    expect(res.vendorDelay).toEqual({ taskId: 'task-caterer', days: 5 });
  });

  it('preserves structured fields when provided on input over raw prompt', () => {
    const res = buildDeterministicChangeResult({
      rawPrompt: '50 more guests and budget dropped 10%',
      guestDelta: 100, // explicit input override
    });
    expect(res.guestDelta).toBe(100);
    expect(res.budgetDeltaPercent).toBe(-10);
  });
});

