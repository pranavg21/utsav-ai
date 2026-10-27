/**
 * @fileoverview Unit tests for runtime type guard utilities.
 * Validates safe narrowing for OccasionType, ExperienceTier, BudgetCategoryName, typedKeys, and safeJsonParse.
 */

import { describe, it, expect } from 'vitest';
import {
  isOccasionType,
  isExperienceTier,
  isBudgetCategoryName,
  typedKeys,
  safeJsonParse,
} from '../utils/typeGuards';

describe('typeGuards utility', () => {
  describe('isOccasionType', () => {
    it('should return true for valid occasion types', () => {
      expect(isOccasionType('wedding')).toBe(true);
      expect(isOccasionType('birthday')).toBe(true);
      expect(isOccasionType('community')).toBe(true);
    });

    it('should return false for invalid strings', () => {
      expect(isOccasionType('festival')).toBe(false);
      expect(isOccasionType('')).toBe(false);
      expect(isOccasionType('random')).toBe(false);
    });
  });

  describe('isExperienceTier', () => {
    it('should return true for valid experience tiers', () => {
      expect(isExperienceTier('intimate')).toBe(true);
      expect(isExperienceTier('balanced')).toBe(true);
      expect(isExperienceTier('grand')).toBe(true);
    });

    it('should return false for invalid strings', () => {
      expect(isExperienceTier('luxury')).toBe(false);
      expect(isExperienceTier('budget')).toBe(false);
    });
  });

  describe('isBudgetCategoryName', () => {
    it('should return true for valid budget category names', () => {
      expect(isBudgetCategoryName('Venue & Logistics')).toBe(true);
      expect(isBudgetCategoryName('Catering & Hospitality')).toBe(true);
      expect(isBudgetCategoryName('Contingency Reserve')).toBe(true);
    });

    it('should return false for invalid category names', () => {
      expect(isBudgetCategoryName('Transport')).toBe(false);
      expect(isBudgetCategoryName('Alcohol')).toBe(false);
    });
  });

  describe('typedKeys', () => {
    it('should return keys matching record object keys', () => {
      const sample = { a: 1, b: 2, c: 3 };
      const keys = typedKeys(sample);
      expect(keys).toEqual(['a', 'b', 'c']);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON text into typed object', () => {
      const parsed = safeJsonParse<{ readonly id: number }>('{"id": 42}');
      expect(parsed).toEqual({ id: 42 });
    });

    it('should return null for malformed JSON text', () => {
      const parsed = safeJsonParse<{ readonly id: number }>('invalid-json');
      expect(parsed).toBeNull();
    });
  });
});
