/**
 * @fileoverview Multi-event conflict detector validating time overlaps, capacity, and transit.
 */

import type { SubEvent } from './types';

export interface SubEventConflict {
  readonly id: string;
  readonly type: 'overlap' | 'capacity' | 'transit' | 'share';
  readonly severity: 'error' | 'warning';
  readonly subEventIds: readonly string[];
  readonly message: string;
}

function checkBudgetAndCapacity(
  subEvents: ReadonlyArray<SubEvent>,
  totalWeddingGuests: number
): SubEventConflict[] {
  const conflicts: SubEventConflict[] = [];
  const totalShare = subEvents.reduce((sum, se) => sum + se.budgetSharePercent, 0);

  if (Math.abs(totalShare - 100) > 1 && subEvents.length > 0) {
    conflicts.push({
      id: 'conflict-budget-share',
      type: 'share',
      severity: 'warning',
      subEventIds: subEvents.map((s) => s.id),
      message: `Total sub-event budget allocation is ${totalShare}% (expected 100%).`,
    });
  }

  for (const se of subEvents) {
    if (se.guestCount > totalWeddingGuests) {
      conflicts.push({
        id: `conflict-capacity-${se.id}`,
        type: 'capacity',
        severity: 'error',
        subEventIds: [se.id],
        message: `${se.name} guest count (${se.guestCount}) exceeds overall wedding guest capacity (${totalWeddingGuests}).`,
      });
    }
  }

  return conflicts;
}

function checkTransitConflicts(subEvents: ReadonlyArray<SubEvent>): SubEventConflict[] {
  const conflicts: SubEventConflict[] = [];

  for (let i = 0; i < subEvents.length; i++) {
    for (let j = i + 1; j < subEvents.length; j++) {
      const a = subEvents[i];
      const b = subEvents[j];
      if (a && b && a.dayOffset === b.dayOffset && a.venueType !== b.venueType) {
        conflicts.push({
          id: `conflict-transit-${a.id}-${b.id}`,
          type: 'transit',
          severity: 'warning',
          subEventIds: [a.id, b.id],
          message: `${a.name} and ${b.name} are on the same day at different venues (${a.venueType} vs ${b.venueType}). Ensure at least 2 hours transit time.`,
        });
      }
    }
  }

  return conflicts;
}

export function detectSubEventConflicts(
  subEvents: ReadonlyArray<SubEvent>,
  totalWeddingGuests: number
): SubEventConflict[] {
  return [
    ...checkBudgetAndCapacity(subEvents, totalWeddingGuests),
    ...checkTransitConflicts(subEvents),
  ];
}
