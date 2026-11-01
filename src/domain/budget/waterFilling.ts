/**
 * @fileoverview Iterative water-filling algorithm for budget cut redistribution.
 */

import type { TradeOffScenario } from '../../types/planner';
import { DEFAULT_MAX_CUT_RATIO } from '../shared/constants';
import type { TradeoffOptions, DistributeParams } from './types';

function distributeCuts(params: DistributeParams): {
  remaining: number;
  nextActive: string[];
  progress: boolean;
} {
  const { activeIds, shortfall, weights, caps, cuts } = params;
  const totalWeight = activeIds.reduce((sum, id) => sum + (weights.get(id) ?? 0), 0);
  if (totalWeight <= 0) return { remaining: shortfall, nextActive: [], progress: false };

  let remaining = shortfall;
  const nextActive: string[] = [];
  let progress = false;

  for (const id of activeIds) {
    const w = weights.get(id) ?? 0;
    const share = Math.round((shortfall * w) / totalWeight);
    const current = cuts.get(id) ?? 0;
    const maxAllowed = caps.get(id) ?? 0;
    if (current + share >= maxAllowed) {
      cuts.set(id, maxAllowed);
      remaining -= maxAllowed - current;
    } else {
      cuts.set(id, current + share);
      remaining -= share;
      nextActive.push(id);
    }
    progress = true;
  }
  return { remaining, nextActive, progress };
}

/**
 * Builds a trade-off scenario using iterative water-filling to distribute budget cuts fairly.
 * @param options Scenario configuration including category items, overrun, and priority weights.
 * @returns Fully computed trade-off scenario with savings and itemized category adjustments.
 * @example
 * ```ts
 * const scenario = buildWaterFillingScenario({
 *   id: 'scenario-test',
 *   title: 'Protect Top Priorities',
 *   description: 'Absorbs cuts in lower priority categories.',
 *   whatYouLose: 'Decor downgraded.',
 *   items: budgetItems,
 *   overrunAmount: 50000,
 *   getWeight: (item) => item.priorityWeight,
 * });
 * ```
 */
export function buildWaterFillingScenario(options: TradeoffOptions): TradeOffScenario {
  const { id, title, description, whatYouLose, items, overrunAmount, getWeight, maxCutRatio = DEFAULT_MAX_CUT_RATIO } = options;
  const caps = new Map<string, number>();
  const weights = new Map<string, number>();
  const cuts = new Map<string, number>();

  for (const item of items) {
    weights.set(item.id, getWeight(item));
    caps.set(item.id, Math.round(item.projectedAmount * maxCutRatio));
    cuts.set(item.id, 0);
  }

  let remaining = overrunAmount;
  let activeIds = items.filter((item) => (weights.get(item.id) ?? 0) > 0).map((i) => i.id);

  while (remaining > 1 && activeIds.length > 0) {
    const step = distributeCuts({ activeIds, shortfall: remaining, weights, caps, cuts });
    if (!step.progress) break;
    remaining = step.remaining;
    activeIds = step.nextActive;
  }

  const categoryAdjustments = items.map((item) => {
    const cut = cuts.get(item.id) ?? 0;
    return {
      category: item.category,
      previousAmount: item.projectedAmount,
      revisedAmount: item.projectedAmount - cut,
      deltaAmount: cut === 0 ? 0 : -cut,
      actionNote: cut > 0 ? `Optimized by ₹${cut.toLocaleString('en-IN')}: ${whatYouLose}` : 'Protected; zero reduction.',
    };
  });

  const totalCut = Array.from(cuts.values()).reduce((sum, c) => sum + c, 0);
  const totalProjected = items.reduce((sum, i) => sum + i.projectedAmount, 0);
  const isFeasible = totalCut >= overrunAmount - 1;
  const requiredAdditionalFunds = isFeasible ? 0 : Math.max(0, overrunAmount - totalCut);

  return {
    id,
    title,
    strategySummary: `${description} (${whatYouLose})`,
    revisedTotalSpend: totalProjected - totalCut,
    totalSavings: totalCut,
    isFeasible,
    requiredAdditionalFunds,
    categoryAdjustments,
  };
}
