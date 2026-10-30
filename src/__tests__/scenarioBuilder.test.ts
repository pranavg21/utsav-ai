/**
 * @fileoverview Unit tests for the scenario builder service.
 * Verifies proportional cut distribution, 45% safety caps, protected item handling, and sum invariants.
 */

import { describe, it, expect } from 'vitest';
import { buildScenarioOption } from '../services/scenarioBuilder';
import type { BudgetCategoryItem } from '../types/planner';

const MOCK_ITEMS: BudgetCategoryItem[] = [
  {
    id: 'item-venue',
    category: 'Venue & Logistics',
    allocatedAmount: 240000,
    projectedAmount: 240000,
    isVerifiedQuote: false,
    priorityWeight: 5,
    rationale: 'Baseline allocation',
  },
  {
    id: 'item-caterer',
    category: 'Catering & Hospitality',
    allocatedAmount: 280000,
    projectedAmount: 280000,
    isVerifiedQuote: false,
    priorityWeight: 6,
    rationale: 'Baseline allocation',
  },
  {
    id: 'item-decor',
    category: 'Decor & Ambience',
    allocatedAmount: 120000,
    projectedAmount: 120000,
    isVerifiedQuote: false,
    priorityWeight: 3,
    rationale: 'Baseline allocation',
  },
];

describe('scenarioBuilder - buildScenarioOption', () => {
  it('should generate a scenario with correct metadata and adjustments count', () => {
    const scenario = buildScenarioOption({
      id: 'opt-test',
      title: 'Test Scenario',
      strategySummary: 'Test summary',
      items: MOCK_ITEMS,
      overrunAmount: 50000,
      cutWeightFn: () => 1,
      protectedNote: 'Protected',
      cutNote: 'Cut applied',
    });

    expect(scenario.id).toBe('opt-test');
    expect(scenario.title).toBe('Test Scenario');
    expect(scenario.strategySummary).toBe('Test summary');
    expect(scenario.categoryAdjustments).toHaveLength(3);
  });

  it('should protect items with cut weight of 0', () => {
    const scenario = buildScenarioOption({
      id: 'opt-protect',
      title: 'Quality Preserve',
      strategySummary: 'Preserves catering',
      items: MOCK_ITEMS,
      overrunAmount: 60000,
      cutWeightFn: (item) => (item.category === 'Catering & Hospitality' ? 0 : 1),
      protectedNote: 'Protected note',
      cutNote: 'Cut note',
    });

    const cateringAdj = scenario.categoryAdjustments.find(
      (a) => a.category === 'Catering & Hospitality'
    );
    expect(cateringAdj?.deltaAmount).toBe(0);
    expect(cateringAdj?.revisedAmount).toBe(280000);
    expect(cateringAdj?.actionNote).toBe('Protected note');
  });

  it('should cap reductions at 45% maximum of category projected amount', () => {
    const singleItem: BudgetCategoryItem[] = [
      {
        id: 'item-single',
        category: 'Decor & Ambience',
        allocatedAmount: 100000,
        projectedAmount: 100000,
        isVerifiedQuote: false,
        priorityWeight: 3,
        rationale: 'Baseline allocation',
      },
    ];

    const scenario = buildScenarioOption({
      id: 'opt-cap',
      title: 'Cap Test',
      strategySummary: 'Tests max 45% reduction',
      items: singleItem,
      overrunAmount: 500000,
      cutWeightFn: () => 1,
      protectedNote: 'Protected',
      cutNote: 'Capped cut',
    });

    const decorAdj = scenario.categoryAdjustments[0];
    expect(decorAdj?.deltaAmount).toBe(-45000);
    expect(decorAdj?.revisedAmount).toBe(55000);
  });

  it('should maintain budget mathematical invariant', () => {
    const originalTotal = MOCK_ITEMS.reduce((sum, i) => sum + i.projectedAmount, 0);
    const scenario = buildScenarioOption({
      id: 'opt-invariant',
      title: 'Invariant Test',
      strategySummary: 'Summary',
      items: MOCK_ITEMS,
      overrunAmount: 80000,
      cutWeightFn: (item) => item.priorityWeight,
      protectedNote: 'Protected',
      cutNote: 'Adjusted',
    });

    expect(scenario.revisedTotalSpend + scenario.totalSavings).toBe(originalTotal);
  });
});
