/**
 * @fileoverview Trade-off scenario generation with iterative water-filling cap redistribution.
 */

import type {
  BudgetCategoryItem,
  BudgetEvaluationResult,
  EventContext,
  TradeOffScenario,
} from '../../types/planner';
import type { TradeoffOptions, DistributeParams } from './types';
import { isProtectedByMustHaves } from './allocation';

export type { TradeoffOptions } from './types';

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

export function buildWaterFillingScenario(options: TradeoffOptions): TradeOffScenario {
  const { id, title, description, whatYouLose, items, overrunAmount, getWeight, maxCutRatio = 0.45 } = options;
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

  return { totalBudget, totalProjected, overrunAmount, overrunPercentage, isOverBudget, items: [...items], tradeOffScenarios };
}

function generateScenarios(context: EventContext, items: ReadonlyArray<BudgetCategoryItem>, overrun: number): TradeOffScenario[] {
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
      maxCutRatio: 0.55,
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
      maxCutRatio: 0.55,
    }),
  ].filter((s) => s.totalSavings > 0);
}
