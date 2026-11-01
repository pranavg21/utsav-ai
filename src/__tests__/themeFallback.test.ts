/**
 * @fileoverview Unit tests verifying dynamic deterministic theme adaptation to inputs (10.6).
 */

import { describe, it, expect } from 'vitest';
import { buildDeterministicThemes } from '../services/gemini/themeFallback';
import { WEDDING_PRESET } from '../data/presets';

describe('buildDeterministicThemes dynamic input adaptation (10.6)', () => {
  it('omits kids zone adaptation when children are not attending', () => {
    const withKids = buildDeterministicThemes({
      ...WEDDING_PRESET,
      ageGroups: ['adults', 'children', 'seniors'],
    });
    expect(withKids[0]?.multiGenerationalAdaptations.children).toContain('kids zone');

    const withoutKids = buildDeterministicThemes({
      ...WEDDING_PRESET,
      ageGroups: ['adults', 'seniors'],
    });
    expect(withoutKids[0]?.multiGenerationalAdaptations.children).not.toContain('kids zone');
    expect(withoutKids[0]?.multiGenerationalAdaptations.children).toContain('Adult-oriented');
  });

  it('quotes the exact accessibility needs requested by user', () => {
    const withAccess = buildDeterministicThemes({
      ...WEDDING_PRESET,
      accessibilityNeeds: ['Wheelchair access', 'Sign language interpreter'],
    });
    const adapt = withAccess[0]?.multiGenerationalAdaptations.accessibility;
    expect(adapt).toContain('"Wheelchair access, Sign language interpreter"');
  });

  it('ensures each item in mustHaves appears in at least one concept', () => {
    const mustHaves = ['Live Shehnai', 'Organic Marigold Mandap'];
    const themes = buildDeterministicThemes({
      ...WEDDING_PRESET,
      mustHaves,
    });
    const allSummaries = themes.map((t) => t.atmosphereSummary).join(' ');
    for (const item of mustHaves) {
      expect(allSummaries).toContain(item);
    }
  });

  it('adapts theme atmosphere summaries to experienceTier', () => {
    const grand = buildDeterministicThemes({
      ...WEDDING_PRESET,
      experienceTier: 'grand',
    });
    expect(grand[0]?.atmosphereSummary).toContain('grand');

    const intimate = buildDeterministicThemes({
      ...WEDDING_PRESET,
      experienceTier: 'intimate',
    });
    expect(intimate[0]?.atmosphereSummary).toContain('intimate');
  });

  it('adapts cost fit and per-guest breakdown to budget shifts', () => {
    const highBudget = buildDeterministicThemes({
      ...WEDDING_PRESET,
      totalBudget: 3000000,
      guestCount: 100,
    });
    expect(highBudget[0]?.estimatedCostFit).toBe('Well Within Budget');
    expect(highBudget[0]?.atmosphereSummary).toContain('₹30000/guest');

    const tightBudget = buildDeterministicThemes({
      ...WEDDING_PRESET,
      totalBudget: 200000,
      guestCount: 150,
    });
    expect(tightBudget[0]?.estimatedCostFit).toBe('Moderate Stretch');
    expect(tightBudget[2]?.estimatedCostFit).toBe('Requires Trade-Off');
  });
});
