/**
 * @fileoverview Type definitions for water-filling budget trade-off algorithms.
 */

import type { BudgetCategoryItem } from '../../types/planner';

export interface TradeoffOptions {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly whatYouLose: string;
  readonly items: ReadonlyArray<BudgetCategoryItem>;
  readonly overrunAmount: number;
  readonly getWeight: (item: BudgetCategoryItem) => number;
  readonly maxCutRatio?: number | undefined;
}

export interface DistributeParams {
  readonly activeIds: readonly string[];
  readonly shortfall: number;
  readonly weights: ReadonlyMap<string, number>;
  readonly caps: ReadonlyMap<string, number>;
  readonly cuts: Map<string, number>;
}
