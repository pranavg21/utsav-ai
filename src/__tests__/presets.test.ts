/**
 * @fileoverview Unit tests for preset event configurations.
 * Validates SME Benchmark scenario values and structural integrity of all presets.
 */

import { describe, it, expect } from 'vitest';
import {
  WEDDING_PRESET,
  BIRTHDAY_PRESET,
  COMMUNITY_PRESET,
  ALL_PRESETS,
} from '../data/presets';

describe('presets', () => {
  describe('WEDDING_PRESET (SME Benchmark)', () => {
    it('should match the SME benchmark parameters exactly', () => {
      expect(WEDDING_PRESET.totalBudget).toBe(800000);
      expect(WEDDING_PRESET.guestCount).toBe(200);
      expect(WEDDING_PRESET.daysUntilEvent).toBe(120);
      expect(WEDDING_PRESET.occasion).toBe('wedding');
      expect(WEDDING_PRESET.experienceTier).toBe('grand');
    });

    it('should have complete priority ranking with 6 categories', () => {
      expect(WEDDING_PRESET.priorityRanking).toHaveLength(6);
      expect(WEDDING_PRESET.priorityRanking[0]).toBe('Catering & Hospitality');
      expect(WEDDING_PRESET.priorityRanking[1]).toBe('Venue & Logistics');
    });

    it('should include multi-generational age groups and accessibility', () => {
      expect(WEDDING_PRESET.ageGroups).toContain('children');
      expect(WEDDING_PRESET.ageGroups).toContain('adults');
      expect(WEDDING_PRESET.ageGroups).toContain('seniors');
      expect(WEDDING_PRESET.accessibilityNeeds.length).toBeGreaterThan(0);
      expect(WEDDING_PRESET.mustHaves.length).toBeGreaterThan(0);
    });
  });

  describe('BIRTHDAY_PRESET', () => {
    it('should have valid milestone birthday configuration', () => {
      expect(BIRTHDAY_PRESET.totalBudget).toBe(250000);
      expect(BIRTHDAY_PRESET.guestCount).toBe(80);
      expect(BIRTHDAY_PRESET.daysUntilEvent).toBe(45);
      expect(BIRTHDAY_PRESET.occasion).toBe('birthday');
      expect(BIRTHDAY_PRESET.priorityRanking).toHaveLength(6);
    });
  });

  describe('COMMUNITY_PRESET', () => {
    it('should have valid cultural fest configuration', () => {
      expect(COMMUNITY_PRESET.totalBudget).toBe(500000);
      expect(COMMUNITY_PRESET.guestCount).toBe(350);
      expect(COMMUNITY_PRESET.daysUntilEvent).toBe(60);
      expect(COMMUNITY_PRESET.occasion).toBe('community');
      expect(COMMUNITY_PRESET.priorityRanking).toHaveLength(6);
    });
  });

  describe('ALL_PRESETS list', () => {
    it('should expose presets with descriptive labels', () => {
      expect(ALL_PRESETS).toHaveLength(3);
      for (const preset of ALL_PRESETS) {
        expect(preset.label).toBeTruthy();
        expect(preset.value.totalBudget).toBeGreaterThan(0);
        expect(preset.value.guestCount).toBeGreaterThan(0);
      }
    });
  });
});
