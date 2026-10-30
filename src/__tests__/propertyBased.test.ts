/**
 * @fileoverview Property-based testing via fast-check verifying core engine invariants.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildInitialBudgetItems } from '../domain/budget/allocation';
import { propagateDelay, buildInitialCelebrationTasks } from '../services/timelineDependencyGraph';
import { fnv1aHash } from '../utils/cache';
import type { BudgetCategoryName, EventContext } from '../types/planner';

const CATEGORIES: BudgetCategoryName[] = [
  'Venue & Logistics',
  'Catering & Hospitality',
  'Decor & Ambience',
  'Photography & Media',
  'Entertainment & Rituals',
  'Contingency Reserve',
];

describe('Property-Based Engine Testing (fast-check)', () => {
  it('Property 1: Budget reconciliation holds for any budget and priorities (+/- 1 INR)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 50000, max: 50000000 }),
        fc.integer({ min: 10, max: 5000 }),
        fc.shuffledSubarray(CATEGORIES, { minLength: 6, maxLength: 6 }),
        (totalBudget, guestCount, priorityRanking) => {
          const context: EventContext = {
            occasion: 'wedding',
            eventName: 'Property Test Wedding',
            totalBudget,
            guestCount,
            daysUntilEvent: 90,
            experienceTier: 'grand',
            priorityRanking: [...priorityRanking],
            ageGroups: ['adults'],
            accessibilityNeeds: [],
            mustHaves: [],
          };

          const items = buildInitialBudgetItems(context);
          const sum = items.reduce((acc, item) => acc + item.allocatedAmount, 0);
          expect(Math.abs(sum - totalBudget)).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Timeline DAG delay propagation is strictly idempotent', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 45 }), (delayDays) => {
        const context: EventContext = {
          occasion: 'wedding',
          eventName: 'Idempotence Event',
          totalBudget: 1000000,
          guestCount: 200,
          daysUntilEvent: 120,
          experienceTier: 'grand',
          priorityRanking: [...CATEGORIES],
          ageGroups: ['adults'],
          accessibilityNeeds: [],
          mustHaves: [],
        };

        const initialTasks = buildInitialCelebrationTasks(context);
        const delayedOnce = propagateDelay(initialTasks, 'task-venue', delayDays);
        const delayedTwice = propagateDelay(delayedOnce, 'task-venue', delayDays);

        const targetOnce = delayedOnce.find((t) => t.id === 'task-caterer');
        const targetTwice = delayedTwice.find((t) => t.id === 'task-caterer');
        expect(targetOnce?.daysBeforeEvent).toBe(targetTwice?.daysBeforeEvent);
        expect(targetOnce?.delayDays).toBe(targetTwice?.delayDays);
      }),
      { numRuns: 50 }
    );
  });

  it('Property 3: FNV-1a hash distribution produces zero collisions across 1,000 change requests', () => {
    const hashes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      const prompt = `change-request-${i}: add ${i * 3} guests, budget cut ${(i % 20) + 1}%`;
      const hash = fnv1aHash(prompt);
      expect(hash).toHaveLength(8);
      hashes.add(hash);
    }
    expect(hashes.size).toBe(1000);
  });
});
