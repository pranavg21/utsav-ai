/**
 * @fileoverview Unit tests for Zod validation schemas.
 * Validates strict parsing, numeric constraints, union checking, and error throwing on bad input.
 */

import { describe, it, expect } from 'vitest';
import {
  validateEventContext,
  validateChangeRequest,
  validateVendorQuote,
  safeValidateEventContext,
  safeValidateChangeRequest,
  safeValidateVendorQuote,
} from '../utils/schemas';
import { WEDDING_PRESET } from '../data/presets';

describe('Zod validation schemas', () => {
  describe('validateEventContext & safeValidate', () => {
    it('validates valid preset context and returns okResult', () => {
      const validated = validateEventContext(WEDDING_PRESET);
      expect(validated.occasion).toBe('wedding');
      expect(validated.totalBudget).toBe(800000);

      const safeRes = safeValidateEventContext(WEDDING_PRESET);
      expect(safeRes.ok).toBe(true);
    });

    it('throws and returns errResult on invalid occasion or budget', () => {
      const invalid = { ...WEDDING_PRESET, occasion: 'festival' };
      expect(() => validateEventContext(invalid)).toThrow();
      expect(safeValidateEventContext(invalid).ok).toBe(false);

      const negBudget = { ...WEDDING_PRESET, totalBudget: -5000 };
      expect(() => validateEventContext(negBudget)).toThrow();
      expect(safeValidateEventContext(negBudget).ok).toBe(false);
    });
  });

  describe('validateChangeRequest & safeValidate', () => {
    it('validates change request payload and returns okResult', () => {
      const valid = { rawPrompt: 'Add 50 guests', guestDelta: 50 };
      const validated = validateChangeRequest(valid);
      expect(validated.rawPrompt).toBe('Add 50 guests');
      expect(safeValidateChangeRequest(valid).ok).toBe(true);
    });

    it('throws and returns errResult on empty prompt', () => {
      expect(() => validateChangeRequest({ rawPrompt: '' })).toThrow();
      expect(safeValidateChangeRequest({ rawPrompt: '' }).ok).toBe(false);
    });
  });

  describe('validateVendorQuote & safeValidate', () => {
    const validQuote = {
      id: 'quote-test',
      vendorName: 'Royal Palace Banquet',
      category: 'Venue & Logistics' as const,
      quotedPrice: 320000,
      guestCapacity: 250,
      isVerifiedQuote: false,
      inclusions: ['Hall', 'Chairs'],
      hiddenRisks: ['Generator surcharge'],
      clarificationQuestions: ['GST included?'],
    };

    it('validates valid vendor quote and returns okResult', () => {
      const validated = validateVendorQuote(validQuote);
      expect(validated.vendorName).toBe('Royal Palace Banquet');
      expect(safeValidateVendorQuote(validQuote).ok).toBe(true);
    });

    it('throws and returns errResult on negative price', () => {
      const invalid = { ...validQuote, quotedPrice: -100 };
      expect(() => validateVendorQuote(invalid)).toThrow();
      expect(safeValidateVendorQuote(invalid).ok).toBe(false);
    });
  });
});
