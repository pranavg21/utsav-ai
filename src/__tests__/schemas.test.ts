/**
 * @fileoverview Unit tests for Zod validation schemas.
 * Validates strict parsing, numeric constraints, union checking, and error throwing on bad input.
 */

import { describe, it, expect } from 'vitest';
import {
  validateEventContext,
  validateChangeRequest,
  validateVendorQuote,
} from '../utils/schemas';
import { WEDDING_PRESET } from '../data/presets';

describe('Zod validation schemas', () => {
  describe('validateEventContext', () => {
    it('should validate valid preset context successfully', () => {
      const validated = validateEventContext(WEDDING_PRESET);
      expect(validated.occasion).toBe('wedding');
      expect(validated.totalBudget).toBe(800000);
    });

    it('should throw validation error on invalid occasion', () => {
      const invalid = { ...WEDDING_PRESET, occasion: 'festival' };
      expect(() => validateEventContext(invalid)).toThrow();
    });

    it('should throw validation error on negative budget', () => {
      const invalid = { ...WEDDING_PRESET, totalBudget: -5000 };
      expect(() => validateEventContext(invalid)).toThrow();
    });
  });

  describe('validateChangeRequest', () => {
    it('should validate valid change request payload', () => {
      const valid = { rawPrompt: 'Add 50 guests', guestDelta: 50 };
      const validated = validateChangeRequest(valid);
      expect(validated.rawPrompt).toBe('Add 50 guests');
      expect(validated.guestDelta).toBe(50);
    });

    it('should throw on empty prompt', () => {
      expect(() => validateChangeRequest({ rawPrompt: '' })).toThrow();
    });
  });

  describe('validateVendorQuote', () => {
    it('should validate valid vendor quote payload', () => {
      const quote = {
        id: 'quote-test',
        vendorName: 'Royal Palace Banquet',
        category: 'Venue & Logistics',
        quotedPrice: 320000,
        guestCapacity: 250,
        isVerifiedQuote: false,
        inclusions: ['Hall', 'Chairs'],
        hiddenRisks: ['Generator surcharge'],
        clarificationQuestions: ['GST included?'],
      };
      const validated = validateVendorQuote(quote);
      expect(validated.vendorName).toBe('Royal Palace Banquet');
      expect(validated.quotedPrice).toBe(320000);
    });

    it('should throw on negative price', () => {
      const quote = {
        id: 'quote-test',
        vendorName: 'Royal Palace Banquet',
        category: 'Venue & Logistics',
        quotedPrice: -100,
        guestCapacity: 250,
        isVerifiedQuote: false,
        inclusions: [],
        hiddenRisks: [],
        clarificationQuestions: [],
      };
      expect(() => validateVendorQuote(quote)).toThrow();
    });
  });
});
