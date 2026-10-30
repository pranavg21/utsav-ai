/**
 * @fileoverview Unit tests for Gemini Planner with mocked successful API responses.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as client from '../services/gemini/client';
import type * as ClientModule from '../services/gemini/client';
import { parseChangeRequest, generateThemes } from '../services/gemini/planner';
import { WEDDING_PRESET } from '../data/presets';
import { clearCache } from '../utils/cache';

vi.mock('../services/gemini/client', async (importOriginal) => {
  const actual = await importOriginal<typeof ClientModule>();
  return {
    ...actual,
    executeGeminiPrompt: vi.fn(),
  };
});

describe('Gemini Planner (mocked responses)', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });

  it('parses change request when Gemini returns valid JSON', async () => {
    const mockPayload = {
      guestDelta: 25,
      budgetDeltaPercent: -10,
      timelineDeltaDays: 7,
      impactSummary: 'AI parsed change successfully',
      recommendedActions: ['Adjust catering', 'Update invitations'],
    };

    vi.mocked(client.executeGeminiPrompt).mockResolvedValueOnce(JSON.stringify(mockPayload));

    const result = await parseChangeRequest(WEDDING_PRESET, {
      rawPrompt: 'add 25 guests and cut 10% budget',
    });

    expect(result.guestDelta).toBe(25);
    expect(result.budgetDeltaPercent).toBe(-10);
    expect(result.impactSummary).toBe('AI parsed change successfully');
  });

  it('generates themes when Gemini returns valid JSON array', async () => {
    const mockThemes = [
      {
        id: 'mock-1',
        title: 'Royal Heritage',
        estimatedCostFit: 'Well Within Budget',
        atmosphereSummary: 'Regal ambience',
        multiGenerationalAdaptations: {
          children: 'Play area',
          adults: 'Lounge',
          seniors: 'Low seating',
          accessibility: 'Ramps everywhere',
        },
        budgetFriendlyAlternative: 'Local florals',
      },
    ];

    vi.mocked(client.executeGeminiPrompt).mockResolvedValueOnce(JSON.stringify(mockThemes));

    const themes = await generateThemes(WEDDING_PRESET);
    expect(themes).toHaveLength(1);
    expect(themes[0]?.title).toBe('Royal Heritage');
  });
});
