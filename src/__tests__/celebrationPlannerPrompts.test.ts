/**
 * @fileoverview Unit tests for Gemini prompt generation templates.
 * Verifies that structured prompts include required context fields, guidelines, and JSON schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  buildChangeRequestPrompt,
  buildVendorQuoteParsePrompt,
  buildThemeGenerationPrompt,
} from '../prompts/celebrationPlannerPrompts';
import { WEDDING_PRESET } from '../data/presets';

describe('celebrationPlannerPrompts', () => {
  describe('buildChangeRequestPrompt', () => {
    it('should include event context and the user change request text', () => {
      const prompt = buildChangeRequestPrompt(WEDDING_PRESET, 'Add 50 extra guests and live DJ');
      expect(prompt).toContain('wedding');
      expect(prompt).toContain('8,00,000');
      expect(prompt).toContain('200');
      expect(prompt).toContain('Add 50 extra guests and live DJ');
    });

    it('should specify required JSON schema keys in instructions', () => {
      const prompt = buildChangeRequestPrompt(WEDDING_PRESET, 'Postpone by 2 weeks');
      expect(prompt).toContain('"guestDelta"');
      expect(prompt).toContain('"budgetDeltaPercent"');
      expect(prompt).toContain('"timelineDeltaDays"');
      expect(prompt).toContain('"impactSummary"');
      expect(prompt).toContain('"recommendedActions"');
    });
  });

  describe('buildVendorQuoteParsePrompt', () => {
    it('should include raw quote text and target budget category', () => {
      const rawText = 'Royal Caterers: ₹3,20,000 for 200 guests with live chaat counters.';
      const prompt = buildVendorQuoteParsePrompt(rawText, 'Catering & Hospitality');
      expect(prompt).toContain('Catering & Hospitality');
      expect(prompt).toContain('Royal Caterers: ₹3,20,000');
    });

    it('should mandate structured JSON output format with risk analysis keys', () => {
      const prompt = buildVendorQuoteParsePrompt('test', 'Venue & Logistics');
      expect(prompt).toContain('"vendorName"');
      expect(prompt).toContain('"quotedPrice"');
      expect(prompt).toContain('"guestCapacity"');
      expect(prompt).toContain('"inclusions"');
      expect(prompt).toContain('"hiddenRisks"');
      expect(prompt).toContain('"clarificationQuestions"');
    });
  });

  describe('buildThemeGenerationPrompt', () => {
    it('should include per-guest calculation and multi-generational context', () => {
      const prompt = buildThemeGenerationPrompt(WEDDING_PRESET);
      // 800000 / 200 = 4000
      expect(prompt).toContain('₹4000/guest');
      expect(prompt).toContain('Grand Family Wedding');
      expect(prompt).toContain('children, adults, seniors');
      expect(prompt).toContain('grand');
    });

    it('should request 3 concepts with multi-generational adaptation keys', () => {
      const prompt = buildThemeGenerationPrompt(WEDDING_PRESET);
      expect(prompt).toContain('"multiGenerationalAdaptations"');
      expect(prompt).toContain('"children"');
      expect(prompt).toContain('"seniors"');
      expect(prompt).toContain('"accessibility"');
      expect(prompt).toContain('"budgetFriendlyAlternative"');
    });
  });
});
