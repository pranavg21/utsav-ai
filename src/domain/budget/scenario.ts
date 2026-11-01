/**
 * @fileoverview Trade-off scenario builder helper.
 * Distributes required savings proportionally across eligible categories using custom weight selectors.
 */

import type { BudgetCategoryItem, TradeOffScenario } from '../../types/planner';

/** Options for constructing a trade-off optimization scenario. */
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
 * Distributes required savings proportionally across eligible categories using custom weights.
 * @param options Scenario parameters including overrun, items, and cut weight function.
 * @returns Fully constructed trade-off scenario with item adjustments.
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

  const totalSavings = categoryAdjustments.reduce(
    (sum, adj) => sum + Math.abs(adj.deltaAmount),
    0
  );
  const totalProjected = items.reduce((sum, item) => sum + item.projectedAmount, 0);

  return {
    id,
    title,
    strategySummary,
    revisedTotalSpend: totalProjected - totalSavings,
    totalSavings,
    isFeasible: totalSavings >= overrunAmount,
    requiredAdditionalFunds: Math.max(0, overrunAmount - totalSavings),
    categoryAdjustments,
  };
}
