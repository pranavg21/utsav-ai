/**
 * @fileoverview Type contract tests for core planner interfaces.
 * Validates domain model contracts and shape conformance for EventContext and BudgetCategoryItem.
 */

import { describe, it, expect } from 'vitest';
import type { EventContext, BudgetCategoryItem, BudgetEvaluationResult } from '../types/planner';
import { WEDDING_PRESET } from '../data/presets';

describe('planner type contracts', () => {
  it('should conform to EventContext interface shape', () => {
    const context: EventContext = WEDDING_PRESET;

    expect(context.occasion).toBe('wedding');
    expect(context.totalBudget).toBeGreaterThan(0);
    expect(context.guestCount).toBeGreaterThan(0);
    expect(context.priorityRanking.length).toBeGreaterThan(0);
    expect(Array.isArray(context.ageGroups)).toBe(true);
    expect(Array.isArray(context.mustHaves)).toBe(true);
  });

  it('should conform to BudgetCategoryItem interface shape', () => {
    const item: BudgetCategoryItem = {
      id: 'cat-1',
      category: 'Venue & Logistics',
      allocatedAmount: 300000,
      projectedAmount: 320000,
      isVerifiedQuote: false,
      priorityWeight: 5,
      rationale: 'Initial estimate',
    };

    expect(item.id).toBe('cat-1');
    expect(item.category).toBe('Venue & Logistics');
    expect(item.allocatedAmount).toBe(300000);
    expect(item.isVerifiedQuote).toBe(false);
  });

  it('should conform to BudgetEvaluationResult shape', () => {
    const result: BudgetEvaluationResult = {
      totalBudget: 1000000,
      totalProjected: 1100000,
      overrunAmount: 100000,
      overrunPercentage: 10,
      isOverBudget: true,
      items: [],
      tradeOffScenarios: [],
    };

    expect(result.isOverBudget).toBe(true);
    expect(result.overrunAmount).toBe(100000);
  });
});
