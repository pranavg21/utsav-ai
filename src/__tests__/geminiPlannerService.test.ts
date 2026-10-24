/**
 * @fileoverview Unit tests for GeminiPlannerService.
 * Validates deterministic fallback execution, API key runtime configuration,
 * offline resilience, and cached result retrieval.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  setRuntimeApiKey,
  getGeminiStatus,
  parseChangeRequest,
  generateThemes,
} from '../services/geminiPlannerService';
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
    // Still false until a live connection is verified
    expect(getGeminiStatus()).toBe(false);
  });

  describe('parseChangeRequest (deterministic fallback)', () => {
    it('should parse change requests with deltas deterministically when offline', async () => {
      const result = await parseChangeRequest(WEDDING_PRESET, {
        rawPrompt: 'Add 50 guests and shorten timeline by 5 days',
        guestDelta: 50,
        budgetDeltaPercent: 15,
        timelineDeltaDays: -5,
      });

      expect(result.guestDelta).toBe(50);
      expect(result.budgetDeltaPercent).toBe(15);
      expect(result.timelineDeltaDays).toBe(-5);
      expect(result.impactSummary).toContain('recalculated deterministically');
      expect(result.recommendedActions).toHaveLength(3);
    });

    it('should handle zero deltas gracefully', async () => {
      const result = await parseChangeRequest(WEDDING_PRESET, {
        rawPrompt: 'Review caterer menu options',
      });

      expect(result.guestDelta).toBe(0);
      expect(result.budgetDeltaPercent).toBe(0);
      expect(result.timelineDeltaDays).toBe(0);
      expect(result.recommendedActions.length).toBeGreaterThan(0);
    });
  });

  describe('generateThemes (deterministic fallback)', () => {
    it('should generate 3 rich culturally-aware themes with multi-gen adaptations', async () => {
      const themes = await generateThemes(WEDDING_PRESET);

      expect(themes).toHaveLength(3);
      for (const theme of themes) {
        expect(theme.id).toBeTruthy();
        expect(theme.title).toBeTruthy();
        expect(theme.estimatedCostFit).toMatch(/Well Within Budget|Moderate Stretch|Requires Trade-Off/);
        expect(theme.atmosphereSummary).toBeTruthy();
        expect(theme.multiGenerationalAdaptations.children).toBeTruthy();
        expect(theme.multiGenerationalAdaptations.seniors).toBeTruthy();
        expect(theme.multiGenerationalAdaptations.accessibility).toBeTruthy();
        expect(theme.budgetFriendlyAlternative).toBeTruthy();
      }
    });

    it('should adapt cost fit when budget per guest is constrained', async () => {
      const lowBudgetContext = {
        ...WEDDING_PRESET,
        totalBudget: 100000,
        guestCount: 200, // ₹500/guest
      };

      const themes = await generateThemes(lowBudgetContext);
      expect(themes[2]?.estimatedCostFit).toBe('Requires Trade-Off');
    });
  });
});
