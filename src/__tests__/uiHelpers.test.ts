/**
 * @fileoverview Unit tests for shared UI helper utilities and formatting functions.
 * Tests currency formatting, delta coloring, error extraction, and icon mappings.
 */

import { describe, it, expect } from 'vitest';
import {
  formatINR,
  getDeltaColorClass,
  extractErrorMessage,
  CATEGORY_ICONS,
  CARD_CLASSES,
  BADGE_BASE,
} from '../utils/uiHelpers';
import type { BudgetCategoryName } from '../types/planner';

describe('uiHelpers', () => {
  describe('formatINR', () => {
    it('should format numbers with Indian Rupee symbol and commas', () => {
      const formatted = formatINR(800000);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('8,00,000');
    });

    it('should handle zero correctly', () => {
      expect(formatINR(0)).toBe('₹0');
    });

    it('should format small amounts', () => {
      expect(formatINR(500)).toBe('₹500');
    });
  });

  describe('getDeltaColorClass', () => {
    it('should return green styling for savings (negative delta)', () => {
      expect(getDeltaColorClass(-5000)).toContain('text-emerald-400');
    });

    it('should return red styling for overrun (positive delta)', () => {
      expect(getDeltaColorClass(5000)).toContain('text-red-400');
    });

    it('should return neutral slate styling for zero delta', () => {
      expect(getDeltaColorClass(0)).toContain('text-slate-400');
    });
  });

  describe('extractErrorMessage', () => {
    it('should extract message from Error instances', () => {
      const err = new Error('Network timeout');
      expect(extractErrorMessage(err)).toBe('Network timeout');
    });

    it('should convert string errors safely', () => {
      expect(extractErrorMessage('Direct error string')).toBe('Direct error string');
    });

    it('should convert arbitrary objects or primitives safely', () => {
      expect(extractErrorMessage(404)).toBe('404');
      expect(extractErrorMessage(null)).toBe('null');
    });
  });

  describe('CATEGORY_ICONS and styles', () => {
    it('should have icon mapping for all standard categories', () => {
      const categories: BudgetCategoryName[] = [
        'Venue & Logistics',
        'Catering & Hospitality',
        'Decor & Ambience',
        'Photography & Media',
        'Entertainment & Rituals',
        'Contingency Reserve',
      ];

      for (const cat of categories) {
        expect(CATEGORY_ICONS[cat]).toBeDefined();
        expect(typeof CATEGORY_ICONS[cat]).toBe('string');
      }
    });

    it('should export non-empty standard style constants', () => {
      expect(CARD_CLASSES.length).toBeGreaterThan(0);
      expect(BADGE_BASE.length).toBeGreaterThan(0);
    });
  });
});
