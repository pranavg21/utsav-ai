/**
 * @fileoverview Priority-weighted Budget Allocation & Overrun Trade-Off Engine.
 * Implements SME requirement: never slash all categories blindly when expenses rise by 20%+;
 * instead, compute three distinct priority-aligned trade-off scenarios with transparent deltas.
 */

import type {
  BudgetCategoryItem,
  BudgetCategoryName,
  BudgetEvaluationResult,
  EventContext,
  TradeOffScenario,
} from '../types/planner';
import { buildScenarioOption } from './scenarioBuilder';
import { typedKeys } from '../utils/typeGuards';

/** Baseline percentage shares before user priority weighting is applied. */
const BASE_CATEGORY_SHARES: Record<BudgetCategoryName, number> = {
  'Venue & Logistics': 0.26,
  'Catering & Hospitality': 0.32,
  'Decor & Ambience': 0.16,
  'Photography & Media': 0.10,
  'Entertainment & Rituals': 0.08,
  'Contingency Reserve': 0.08,
};

/**
 * Generates an initial priority-weighted budget breakdown from the user's diagnostic context.
 * All initial rows default to `isVerifiedQuote: false` (AI Estimate Assumption guardrail).
 *
 * @param context - Validated user event context including totalBudget and priorityRanking.
 * @param simulatedOverrunRatio - Optional multiplier (e.g., 1.2 for +20% expense overrun test).
 * @returns Array of structured BudgetCategoryItem entries.
 */
/** Boost factor per priority ranking rank step. */
const PRIORITY_RANK_BOOST_FACTOR = 0.015;

/** Fallback base weight when category share is not defined. */
const DEFAULT_CATEGORY_WEIGHT = 0.1;

export function buildInitialBudgetItems(
  context: EventContext,
  simulatedOverrunRatio = 1.0
): BudgetCategoryItem[] {
  const categories = typedKeys(BASE_CATEGORY_SHARES);
  const rawWeights: Record<BudgetCategoryName, number> = { ...BASE_CATEGORY_SHARES };

  context.priorityRanking.forEach((category, index) => {
    const rankBoost = (categories.length - index) * PRIORITY_RANK_BOOST_FACTOR;
    rawWeights[category] = (rawWeights[category] ?? DEFAULT_CATEGORY_WEIGHT) + rankBoost;
  });

  const weightSum = Object.values(rawWeights).reduce((sum, val) => sum + val, 0);

  return categories.map((category, idx) => {
    const normalizedShare = rawWeights[category] / weightSum;
    const allocatedAmount = Math.round(context.totalBudget * normalizedShare);
    const rankIndex = context.priorityRanking.indexOf(category);
    const priorityWeight = rankIndex === -1 ? 1 : categories.length - rankIndex;
    const projectedAmount = Math.round(allocatedAmount * simulatedOverrunRatio);

    return {
      id: `cat-${idx + 1}`,
      category,
      allocatedAmount,
      projectedAmount,
      isVerifiedQuote: false,
      priorityWeight,
      rationale:
        priorityWeight >= 5
          ? `High user priority (#${rankIndex + 1}); protected allocation for ${context.guestCount} guests.`
          : `Standard priority (#${rankIndex + 1}) scaled for ${context.experienceTier} tier.`,
    };
  });
}

/**
 * Evaluates current budget items against total budget and synthesizes 3 priority-aligned
 * trade-off scenarios whenever projected expenses exceed target budget.
 *
 * @param context - Active event context.
 * @param items - Current budget line items.
 * @returns Complete BudgetEvaluationResult with overrun metrics and trade-off options.
 */
export function evaluateBudgetAndTradeoffs(
  context: EventContext,
  items: BudgetCategoryItem[]
): BudgetEvaluationResult {
  const totalBudget = Math.max(1, context.totalBudget);
  const totalProjected = items.reduce((sum, item) => sum + item.projectedAmount, 0);
  const overrunAmount = Math.max(0, totalProjected - totalBudget);
  const overrunPercentage = Number(((overrunAmount / totalBudget) * 100).toFixed(1));
  const isOverBudget = overrunAmount > 0;

  const tradeOffScenarios: TradeOffScenario[] = isOverBudget
    ? generateTradeOffScenarios(context, items, overrunAmount)
    : [];

  return {
    totalBudget,
    totalProjected,
    overrunAmount,
    overrunPercentage,
    isOverBudget,
    items,
    tradeOffScenarios,
  };
}

/**
 * Builds three distinct trade-off strategies to resolve an expense overrun without blind uniform cuts.
 */
function generateTradeOffScenarios(
  context: EventContext,
  items: BudgetCategoryItem[],
  overrunAmount: number
): TradeOffScenario[] {
  const topTwoPriorities = new Set(context.priorityRanking.slice(0, 2));

  // Option A: Strictly protect top 2 user priorities; absorb cuts in lower-priority flexible categories
  const optionA = buildScenarioOption(
    'scenario-protect-priorities',
    `Protect Top Priorities (${context.priorityRanking.slice(0, 2).join(' & ')})`,
    'Leaves your top 2 priority categories 100% untouched while trimming lower-priority decor, media packages, and non-essential add-ons.',
    items,
    overrunAmount,
    (item) => (topTwoPriorities.has(item.category) || item.isVerifiedQuote ? 0 : 7 - item.priorityWeight),
    'Protected top user priority; zero reduction applied.',
    'Trimmed lower-priority scope to absorb overrun.'
  );

  // Option B: Value-engineer Venue & Decor logistics while preserving per-plate guest hospitality
  const optionB = buildScenarioOption(
    'scenario-hospitality-first',
    'Guest Hospitality First (Optimize Venue & Decor Scale)',
    'Preserves full Catering & Hospitality quality for all guests while shifting to modular seasonal decor and off-peak venue packages.',
    items,
    overrunAmount,
    (item) => {
      if (item.category === 'Catering & Hospitality' || item.isVerifiedQuote) return 0;
      if (item.category === 'Decor & Ambience' || item.category === 'Venue & Logistics') return 4;
      return 1.5;
    },
    'Hospitality & per-guest dining experience preserved.',
    'Switched to modular seasonal floral/lighting & optimized venue package.'
  );

  // Option C: Tiered Phasing & Scope Re-calibration across unverified estimates
  const optionC = buildScenarioOption(
    'scenario-phased-recalibration',
    'Smart Scope Rebalance Across Unverified Estimates',
    'Protects all locked vendor quotes and #1 priority while proportionally right-sizing unverified AI estimates.',
    items,
    overrunAmount,
    (item) => {
      if (item.isVerifiedQuote || item.category === context.priorityRanking[0]) return 0;
      return Math.max(1, 6 - item.priorityWeight);
    },
    'Locked quote or #1 must-have priority held steady.',
    'Right-sized unverified estimate to restore budget equilibrium.'
  );

  return [optionA, optionB, optionC];
}