/**
 * @fileoverview Trade-off scenario builder helper extracted from the budget trade-off engine.
 * Distributes required savings proportionally across eligible categories using custom weight selectors.
 */

import type { BudgetCategoryItem, TradeOffScenario } from '../types/planner';

export interface ScenarioBuilderOptions {
  readonly id: string;
  readonly title: string;
  readonly strategySummary: string;
  readonly items: ReadonlyArray<BudgetCategoryItem>;
  readonly overrunAmount: number;
  readonly cutWeightFn: (item: BudgetCategoryItem) => number;
  readonly protectedNote: string;
  readonly cutNote: string;
}

/**
 * Distributes required savings proportionally across eligible categories
 * using a custom weight selector function. Categories with weight 0 are protected.
 */
export function buildScenarioOption(options: ScenarioBuilderOptions): TradeOffScenario {
  const {
    id,
    title,
    strategySummary,
    items,
    overrunAmount,
    cutWeightFn,
    protectedNote,
    cutNote,
  } = options;

  const weights = items.map(cutWeightFn);
  const totalCutWeight = weights.reduce((sum, w) => sum + w, 0) || 1;

  const categoryAdjustments = items.map((item, idx) => {
    const shareOfCut = (weights[idx] ?? 0) / totalCutWeight;
    const rawReduction = Math.round(overrunAmount * shareOfCut);
    const maxSafeReduction = Math.round(item.projectedAmount * 0.45);
    const actualReduction = Math.min(rawReduction, maxSafeReduction);
    const revisedAmount = item.projectedAmount - actualReduction;

    return {
      category: item.category,
      previousAmount: item.projectedAmount,
      revisedAmount,
      deltaAmount: actualReduction === 0 ? 0 : -actualReduction,
      actionNote: actualReduction === 0 ? protectedNote : cutNote,
    };
  });

  const revisedTotalSpend = categoryAdjustments.reduce((sum, adj) => sum + adj.revisedAmount, 0);
  const totalSavings = items.reduce((sum, i) => sum + i.projectedAmount, 0) - revisedTotalSpend;

  return {
    id,
    title,
    strategySummary,
    revisedTotalSpend,
    totalSavings,
    categoryAdjustments,
  };
}
