/**
 * @fileoverview Unit tests for GeminiPlannerService and high-level Gemini planner integration.
 * Validates deterministic fallback execution, API key runtime configuration,
 * offline resilience, and provenance tracking.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setRuntimeApiKey,
  getGeminiStatus,
  parseChangeRequestWithAi,
  generateThemesWithAi,
  parseChangeRequest,
  generateThemes,
} from '../services/gemini/planner';
import { WEDDING_PRESET } from '../data/presets';
import { clearCache } from '../utils/cache';

describe('geminiPlannerService', () => {
  beforeEach(() => {
    clearCache();
    setRuntimeApiKey('');
  });

  it('should reflect disconnected state when no API key is provided', () => {
    expect(getGeminiStatus()).toBe(false);
  });

  it('should accept runtime API key without throwing', () => {
    setRuntimeApiKey('test-runtime-api-key');
    expect(getGeminiStatus()).toBe(false);
  });

  describe('parseChangeRequestWithAi (deterministic fallback)', () => {
    it('should parse change requests with deltas deterministically when offline', async () => {
      const result = await parseChangeRequestWithAi(WEDDING_PRESET, {
        rawPrompt: 'Add 50 guests and shorten timeline by 5 days',
        guestDelta: 50,
        budgetDeltaPercent: 15,
        timelineDeltaDays: -5,
      });

      expect(result.provenance.source).toBe('deterministic');
      expect(result.provenance.reason).toBe('no-api-key');
      expect(result.data.guestDelta).toBe(50);
      expect(result.data.budgetDeltaPercent).toBe(15);
      expect(result.data.timelineDeltaDays).toBe(-5);
      expect(result.data.impactSummary).toContain('recalculated deterministically');
      expect(result.data.recommendedActions).toHaveLength(3);
    });

    it('should handle zero deltas gracefully', async () => {
      const result = await parseChangeRequestWithAi(WEDDING_PRESET, {
        rawPrompt: 'Review caterer menu options',
      });

      expect(result.provenance.source).toBe('deterministic');
      expect(result.data.guestDelta).toBe(0);
      expect(result.data.budgetDeltaPercent).toBe(0);
      expect(result.data.timelineDeltaDays).toBe(0);
      expect(result.data.recommendedActions.length).toBeGreaterThan(0);
    });
  });

  describe('generateThemesWithAi (deterministic fallback)', () => {
    it('should generate 3 rich culturally-aware themes with multi-gen adaptations', async () => {
      const result = await generateThemesWithAi(WEDDING_PRESET);

      expect(result.provenance.source).toBe('deterministic');
      expect(result.data).toHaveLength(3);
      for (const theme of result.data) {
        expect(theme.id).toBeDefined();
        expect(theme.title).toBeDefined();
        expect(theme.estimatedCostFit).toMatch(/Well Within Budget|Moderate Stretch|Requires Trade-Off/);
        expect(theme.multiGenerationalAdaptations.children).toBeDefined();
        expect(theme.multiGenerationalAdaptations.seniors).toBeDefined();
        expect(theme.budgetFriendlyAlternative).toBeDefined();
      }
    });

    it('unwrapped helpers parseChangeRequest and generateThemes return direct domain objects', async () => {
      const parsed = await parseChangeRequest(WEDDING_PRESET, { rawPrompt: 'Test prompt' });
      expect(parsed.guestDelta).toBe(0);

      const themes = await generateThemes(WEDDING_PRESET);
      expect(themes).toHaveLength(3);
    });
  });
});
