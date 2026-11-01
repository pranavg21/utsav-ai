/**
 * @fileoverview Tests for Gemini caching rules: deterministic results must not poison cache,
 * theme cache key must capture all inputs (including accessibilityNeeds),
 * and client must be called once key is set.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as client from '../services/gemini/client';
import type * as ClientModule from '../services/gemini/client';
import { generateThemesWithAi } from '../services/gemini/planner';
import { WEDDING_PRESET } from '../data/presets';
import { clearCache, getCachedResponse, fnv1aHash, SCHEMA_VERSION } from '../utils/cache';
import { buildThemeGenerationPrompt } from '../prompts/celebrationPlannerPrompts';
import { GEMINI_MODEL_ID } from '../services/gemini/config';

vi.mock('../services/gemini/client', async (importOriginal) => {
  const actual = await importOriginal<typeof ClientModule>();
  return {
    ...actual,
    executeStructuredGeminiCall: vi.fn(),
  };
});

describe('Gemini Cache Poisoning & Key Invariants (9.2)', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });

  it('does not cache deterministic fallback results', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: false,
      reason: 'no-api-key',
    });

    const res = await generateThemesWithAi(WEDDING_PRESET);
    expect(res.provenance.source).toBe('deterministic');

    const prompt = buildThemeGenerationPrompt(WEDDING_PRESET);
    const key = fnv1aHash(`${GEMINI_MODEL_ID}:v${SCHEMA_VERSION}:${prompt}`);
    expect(getCachedResponse(key)).toBeNull();
  });

  it('changes theme cache key when accessibilityNeeds changes', () => {
    const prompt1 = buildThemeGenerationPrompt(WEDDING_PRESET);
    const key1 = fnv1aHash(`${GEMINI_MODEL_ID}:v${SCHEMA_VERSION}:${prompt1}`);

    const withAccess = {
      ...WEDDING_PRESET,
      accessibilityNeeds: ['Wheelchair Ramp required for Mandap'],
    };
    const prompt2 = buildThemeGenerationPrompt(withAccess);
    const key2 = fnv1aHash(`${GEMINI_MODEL_ID}:v${SCHEMA_VERSION}:${prompt2}`);

    expect(key1).not.toBe(key2);
  });

  it('calls client after setting API key even if previous deterministic call occurred', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: false,
      reason: 'no-api-key',
    });

    // 1. Call without key -> deterministic
    const res1 = await generateThemesWithAi(WEDDING_PRESET);
    expect(res1.provenance.source).toBe('deterministic');

    // 2. Set key and mock success
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: true,
      data: [
        {
          title: 'Royal Theme',
          description: 'Desc',
          culturalSignificance: 'Heritage',
          estimatedCostFit: 'Well Within Budget',
          ageGroupAdaptations: { children: 'c', seniors: 's', general: 'g' },
          budgetFriendlyAlternative: 'alt',
        },
      ],
      model: GEMINI_MODEL_ID,
    });

    // 3. Second call should NOT return a cached deterministic result; it must invoke the client!
    const res2 = await generateThemesWithAi(WEDDING_PRESET);
    expect(res2.provenance.source).toBe('gemini');
    expect(client.executeStructuredGeminiCall).toHaveBeenCalledTimes(2);
  });
});

