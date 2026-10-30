/**
 * @fileoverview Unit tests for Gemini Planner with mocked successful API responses.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as client from '../services/gemini/client';
import type * as ClientModule from '../services/gemini/client';
import { parseChangeRequestWithAi, generateThemesWithAi } from '../services/gemini/planner';
import { WEDDING_PRESET } from '../data/presets';
import { clearCache } from '../utils/cache';

vi.mock('../services/gemini/client', async (importOriginal) => {
  const actual = await importOriginal<typeof ClientModule>();
  return {
    ...actual,
    executeStructuredGeminiCall: vi.fn(),
  };
});

describe('Gemini Planner (mocked responses)', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });

  it('parses change request when Gemini returns valid JSON', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: true,
      data: {
        changeType: 'guest_count',
        guestDelta: 25,
        amountDelta: -80000,
        targetDaysDelta: 7,
        sentiment: 0.5,
        reasoning: 'AI parsed change successfully',
      },
      model: 'gemini-2.5-flash',
    });

    const result = await parseChangeRequestWithAi(WEDDING_PRESET, {
      rawPrompt: 'add 25 guests and cut 10% budget',
    });

    expect(result.provenance.source).toBe('gemini');
    expect(result.data.guestDelta).toBe(25);
    expect(result.data.budgetDeltaPercent).toBe(-10);
    expect(result.data.impactSummary).toBe('AI parsed change successfully');
  });

  it('generates themes when Gemini returns valid JSON array', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: true,
      data: [
        {
          title: 'Royal Heritage',
          description: 'Regal atmosphere',
          culturalSignificance: 'Heritage celebration',
          estimatedCostFit: 'Well Within Budget',
          ageGroupAdaptations: {
            children: 'Play area',
            seniors: 'Low seating',
            general: 'Ramps everywhere',
          },
          budgetFriendlyAlternative: 'Local florals',
        },
      ],
      model: 'gemini-2.5-flash',
    });

    const result = await generateThemesWithAi(WEDDING_PRESET);
    expect(result.provenance.source).toBe('gemini');
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.title).toBe('Royal Heritage');
  });
});
