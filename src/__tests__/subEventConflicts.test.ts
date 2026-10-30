/**
 * @fileoverview Unit tests for sub-event conflict detection engine.
 */

import { describe, it, expect } from 'vitest';
import { detectSubEventConflicts } from '../domain/subEvents/conflicts';
import { WEDDING_SUB_EVENTS } from '../domain/subEvents/types';

describe('detectSubEventConflicts', () => {
  it('passes cleanly for balanced wedding sub-events with 300 guests', () => {
    const conflicts = detectSubEventConflicts(WEDDING_SUB_EVENTS, 300);
    // Haldi and Mehendi are on same day with different venues, so transit warning is expected
    const errors = conflicts.filter((c) => c.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it('detects capacity breach when sub-event exceeds wedding total', () => {
    const conflicts = detectSubEventConflicts(WEDDING_SUB_EVENTS, 100);
    const capacityErrors = conflicts.filter((c) => c.type === 'capacity');
    expect(capacityErrors.length).toBeGreaterThan(0);
    expect(capacityErrors[0]?.severity).toBe('error');
  });

  it('detects budget share mismatch when sum is not 100%', () => {
    const invalidShares = WEDDING_SUB_EVENTS.map((se) => ({
      ...se,
      budgetSharePercent: 10, // total = 50%
    }));
    const conflicts = detectSubEventConflicts(invalidShares, 300);
    const shareWarning = conflicts.find((c) => c.type === 'share');
    expect(shareWarning).toBeDefined();
    expect(shareWarning?.message).toContain('Total sub-event budget allocation is 50%');
  });
});
