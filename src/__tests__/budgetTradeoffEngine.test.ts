/**
 * @fileoverview Unit tests for the Budget Trade-Off Engine.
 * Tests baseline allocation, +20% overrun detection, priority protection, and verified quote protection.
 */

import { describe, it, expect } from 'vitest';
import { buildInitialBudgetItems, evaluateBudgetAndTradeoffs } from '../services/budgetTradeoffEngine';
import type { EventContext } from '../types/planner';

/** SME Benchmark test context: ₹8,00,000 Wedding | 200 Guests | 120 Days. */
const TEST_CONTEXT: EventContext = {
  occasion: 'wedding',
  eventName: 'Test Wedding',
  totalBudget: 800000,
  guestCount: 200,
  daysUntilEvent: 120,
  experienceTier: 'grand',
  priorityRanking: [
    'Catering & Hospitality', 'Venue & Logistics', 'Photography & Media',
    'Decor & Ambience', 'Entertainment & Rituals', 'Contingency Reserve',
  ],
  ageGroups: ['children', 'adults', 'seniors'],
  accessibilityNeeds: ['Wheelchair ramps'],
  mustHaves: ['Live music'],
};

describe('buildInitialBudgetItems', () => {
  it('should generate 6 budget categories summing close to total budget', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT);
    expect(items).toHaveLength(6);
    const total = items.reduce((sum, i) => sum + i.allocatedAmount, 0);
    expect(total).toBeGreaterThan(790000);
    expect(total).toBeLessThanOrEqual(810000);
  });

  it('should mark all initial items as AI estimates (not verified)', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT);
    for (const item of items) {
      expect(item.isVerifiedQuote).toBe(false);
    }
  });

  it('should assign higher priority weight to top-ranked categories', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT);
    const catering = items.find((i) => i.category === 'Catering & Hospitality');
    const contingency = items.find((i) => i.category === 'Contingency Reserve');
    expect(catering).toBeDefined();
    expect(contingency).toBeDefined();
    expect(catering!.priorityWeight).toBeGreaterThan(contingency!.priorityWeight);
  });

  it('should apply simulated overrun ratio to projected amounts', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT, 1.2);
    for (const item of items) {
      expect(item.projectedAmount).toBeGreaterThan(item.allocatedAmount);
    }
  });
});

describe('evaluateBudgetAndTradeoffs', () => {
  it('should detect +20% overrun and generate 3 trade-off scenarios', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT, 1.2);
    const result = evaluateBudgetAndTradeoffs(TEST_CONTEXT, items);
    expect(result.isOverBudget).toBe(true);
    expect(result.overrunPercentage).toBeGreaterThanOrEqual(19);
    expect(result.tradeOffScenarios).toHaveLength(3);
  });

  it('should not generate trade-offs when within budget', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT, 1.0);
    const result = evaluateBudgetAndTradeoffs(TEST_CONTEXT, items);
    expect(result.isOverBudget).toBe(false);
    expect(result.tradeOffScenarios).toHaveLength(0);
  });

  it('Option A should protect top 2 user priorities from cuts', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT, 1.2);
    const result = evaluateBudgetAndTradeoffs(TEST_CONTEXT, items);
    const optionA = result.tradeOffScenarios[0]!;
    const cateringAdj = optionA.categoryAdjustments.find((a) => a.category === 'Catering & Hospitality');
    const venueAdj = optionA.categoryAdjustments.find((a) => a.category === 'Venue & Logistics');
    expect(Math.abs(cateringAdj?.deltaAmount ?? 1)).toBe(0);
    expect(Math.abs(venueAdj?.deltaAmount ?? 1)).toBe(0);
  });

  it('should protect verified quotes from trade-off cuts', () => {
    const items = buildInitialBudgetItems(TEST_CONTEXT, 1.2);
    items[2]!.isVerifiedQuote = true;
    const result = evaluateBudgetAndTradeoffs(TEST_CONTEXT, items);
    const optionA = result.tradeOffScenarios[0]!;
    const verifiedAdj = optionA.categoryAdjustments.find((a) => a.category === items[2]!.category);
    expect(Math.abs(verifiedAdj?.deltaAmount ?? 1)).toBe(0);
  });
});
