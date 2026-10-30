/**
 * @fileoverview Unit tests for the budget allocation and trade-off engine.
 */

import { describe, it, expect } from 'vitest';
import { buildInitialBudgetItems } from '../domain/budget/allocation';
import { evaluateBudgetAndTradeoffs, buildWaterFillingScenario } from '../domain/budget/tradeoffs';
import type { EventContext } from '../types/planner';

const TEST_CONTEXT: EventContext = {
  occasion: 'wedding',
  eventName: 'Test Wedding',
  totalBudget: 800000,
  guestCount: 150,
  daysUntilEvent: 90,
  experienceTier: 'balanced',
  priorityRanking: [
    'Venue & Logistics',
    'Catering & Hospitality',
    'Decor & Ambience',
    'Photography & Media',
    'Entertainment & Rituals',
    'Contingency Reserve',
  ],
  ageGroups: ['adults', 'seniors'],
  accessibilityNeeds: [],
  mustHaves: ['DJ', 'Mandap'],
};

describe('Budget Allocation & Invariants', () => {
  it('invariant: sum of category budgets always equals total budget within 1 INR', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT);
    expect(items).toHaveLength(6);
    const sum = items.reduce((acc, i) => acc + i.allocatedAmount, 0);
    expect(Math.abs(sum - TEST_CONTEXT.totalBudget)).toBeLessThanOrEqual(1);
  });

  it('marks initial items as AI estimates and weights by priority', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT);
    for (const item of items) expect(item.isVerifiedQuote).toBe(false);
    const venue = items.find((i) => i.category === 'Venue & Logistics');
    const reserve = items.find((i) => i.category === 'Contingency Reserve');
    if (venue && reserve) expect(venue.priorityWeight).toBeGreaterThan(reserve.priorityWeight);
  });
});

describe('Water-Filling Trade-Off Scenarios', () => {
  it('water-filling redistributes remainders when categories hit cap', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT, 1.2);
    const scenario = buildWaterFillingScenario({
      id: 'wf-test',
      title: 'Water Filling Test',
      description: 'Testing cap redistribution',
      whatYouLose: 'Decor and extras',
      items,
      overrunAmount: 160000,
      getWeight: (i) => (i.category === 'Catering & Hospitality' ? 0 : 5),
      maxCutRatio: 0.3,
    });
    expect(scenario.totalSavings).toBeGreaterThan(0);
    const catCut = scenario.categoryAdjustments.find((a) => a.category === 'Catering & Hospitality');
    expect(catCut?.deltaAmount).toBe(0);
  });

  it('infeasible trade-off: flags isFeasible false and reports requiredAdditionalFunds', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT, 2.0); // 100% overrun
    const scenario = buildWaterFillingScenario({
      id: 'infeasible-test',
      title: 'Extreme Overrun',
      description: 'Overrun exceeds available non-essential capacity',
      whatYouLose: 'All non-essentials',
      items,
      overrunAmount: 800000,
      getWeight: (i) => (i.category === 'Venue & Logistics' ? 0 : 2),
      maxCutRatio: 0.2, // Low cap limits savings to ~80k
    });

    expect(scenario.isFeasible).toBe(false);
    expect(scenario.requiredAdditionalFunds).toBeGreaterThan(0);
    expect(scenario.totalSavings).toBeLessThan(800000);
  });

  it('evaluates budget and protects verified quotes', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT, 1.2);
    if (items[2]) items[2].isVerifiedQuote = true;
    const res = evaluateBudgetAndTradeoffs(TEST_CONTEXT, items);
    expect(res.isOverBudget).toBe(true);
    const firstScenario = res.tradeOffScenarios[0];
    if (firstScenario && items[2]) {
      const adj = firstScenario.categoryAdjustments.find((a) => a.category === items[2]?.category);
      expect(adj?.deltaAmount).toBe(0);
    }
  });
});
