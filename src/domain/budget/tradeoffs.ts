/**
 * @fileoverview Trade-off scenario evaluation and budget feasibility analysis.
 */

import type {
  BudgetCategoryItem,
  BudgetEvaluationResult,
  EventContext,
  TradeOffScenario,
} from '../../types/planner';
import { AGGRESSIVE_MAX_CUT_RATIO } from '../shared/constants';
import { isProtectedByMustHaves } from './allocation';
import { buildWaterFillingScenario } from './waterFilling';

export type { TradeoffOptions } from './types';
export { buildWaterFillingScenario } from './waterFilling';

function generateScenarios(
  context: EventContext,
  items: ReadonlyArray<BudgetCategoryItem>,
  overrun: number
): TradeOffScenario[] {
  const topTwo = new Set(context.priorityRanking.slice(0, 2));
  return [
    buildWaterFillingScenario({
      id: 'scenario-protect-priorities',
      title: `Protect Top Priorities (${context.priorityRanking.slice(0, 2).join(' & ')})`,
      description: 'Leaves top 2 priority categories untouched, absorbing cuts in lower priorities.',
      whatYouLose: 'Decor: fresh-flower mandap → marigold garlands & modular fabrics.',
      items,
      overrunAmount: overrun,
      getWeight: (item) =>
        topTwo.has(item.category) ||
        item.isVerifiedQuote ||
        isProtectedByMustHaves(item.category, context.mustHaves)
          ? 0
          : 7 - item.priorityWeight,
      maxCutRatio: AGGRESSIVE_MAX_CUT_RATIO,
    }),
    buildWaterFillingScenario({
      id: 'scenario-hospitality-first',
      title: 'Guest Hospitality First',
      description: 'Preserves full Catering quality while optimizing Venue & Decor logistics.',
      whatYouLose: 'Venue: premium weekend slot → weekday/morning muhurat package.',
      items,
      overrunAmount: overrun,
      getWeight: (item) => {
        if (item.category === 'Catering & Hospitality' || item.isVerifiedQuote) return 0;
        if (item.category === 'Decor & Ambience' || item.category === 'Venue & Logistics') return 4;
        return 1.5;
      },
      maxCutRatio: AGGRESSIVE_MAX_CUT_RATIO,
    }),
  ].filter((s) => s.totalSavings > 0);
}

/**
 * Evaluates budget totals, overrun percentages, and computes viable trade-off scenarios.
 * @param context Celebration event context with priorities and constraints.
 * @param items Current budget category line items.
 * @returns Complete budget evaluation result including overrun status and scenarios.
 */
export function evaluateBudgetAndTradeoffs(
  context: EventContext,
  items: ReadonlyArray<BudgetCategoryItem>
): BudgetEvaluationResult {
  const totalBudget = Math.max(1, context.totalBudget);
  const totalProjected = items.reduce((sum, item) => sum + item.projectedAmount, 0);
  const overrunAmount = Math.max(0, totalProjected - totalBudget);
  const overrunPercentage = Number(((overrunAmount / totalBudget) * 100).toFixed(1));
  const isOverBudget = overrunAmount > 0;
  const tradeOffScenarios = isOverBudget ? generateScenarios(context, items, overrunAmount) : [];

  return {
    totalBudget,
    totalProjected,
    overrunAmount,
    overrunPercentage,
    isOverBudget,
    items: [...items],
    tradeOffScenarios,
  };
}
