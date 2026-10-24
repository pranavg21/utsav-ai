/**
 * @fileoverview Trade-off scenario builder helper extracted from the budget trade-off engine.
 * Distributes required savings proportionally across eligible categories using custom weight selectors.
 */

import type { BudgetCategoryItem, TradeOffScenario } from '../types/planner';

/**
 * Distributes required savings proportionally across eligible categories
 * using a custom weight selector function. Categories with weight 0 are protected.
 *
 * @param id - Unique scenario identifier.
 * @param title - Human-readable strategy title.
 * @param strategySummary - Summary of who this option serves best.
 * @param items - Current budget line items.
 * @param overrunAmount - Total rupee amount to recover.
 * @param cutWeightFn - Function returning cut eligibility weight per item (0 = protected).
 * @param protectedNote - Action note for protected categories.
 * @param cutNote - Action note for categories receiving cuts.
 * @returns A complete TradeOffScenario with per-category adjustments.
 */
export function buildScenarioOption(
  id: string,
  title: string,
  strategySummary: string,
  items: BudgetCategoryItem[],
  overrunAmount: number,
  cutWeightFn: (item: BudgetCategoryItem) => number,
  protectedNote: string,
  cutNote: string
): TradeOffScenario {
  const weights = items.map(cutWeightFn);
  const totalCutWeight = weights.reduce((sum, w) => sum + w, 0) || 1;

  const categoryAdjustments = items.map((item, idx) => {
    const shareOfCut = (weights[idx] ?? 0) / totalCutWeight;
    const rawReduction = Math.round(overrunAmount * shareOfCut);
    /** Cap each category's cut at 45% to prevent gutting any single line. */
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
