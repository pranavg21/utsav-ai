/**
 * @fileoverview Priority-weighted budget allocation domain logic.
 */

import type {
  BudgetCategoryItem,
  BudgetCategoryName,
  EventContext,
} from '../../types/planner';
import { typedKeys } from '../../utils/typeGuards';

/** Baseline percentage shares before user priority weighting is applied. */
export const BASE_CATEGORY_SHARES: Record<BudgetCategoryName, number> = {
  'Venue & Logistics': 0.26,
  'Catering & Hospitality': 0.32,
  'Decor & Ambience': 0.16,
  'Photography & Media': 0.1,
  'Entertainment & Rituals': 0.08,
  'Contingency Reserve': 0.08,
};

const PRIORITY_RANK_BOOST_FACTOR = 0.015;
const DEFAULT_CATEGORY_WEIGHT = 0.1;

/**
 * Builds initial category budget items with priority weighting.
 */
export function buildInitialBudgetItems(
  context: EventContext,
  simulatedOverrunRatio = 1.0
): BudgetCategoryItem[] {
  const categories = typedKeys(BASE_CATEGORY_SHARES);
  const rawWeights: Record<BudgetCategoryName, number> = { ...BASE_CATEGORY_SHARES };

  context.priorityRanking.forEach((category, index) => {
    const rankBoost = (categories.length - index) * PRIORITY_RANK_BOOST_FACTOR;
    const currentWeight = rawWeights[category] ?? DEFAULT_CATEGORY_WEIGHT;
    rawWeights[category] = currentWeight + rankBoost;
  });

  const weightSum = Object.values(rawWeights).reduce((sum, val) => sum + val, 0);

  const items: BudgetCategoryItem[] = categories.map((category, idx) => {
    const normalizedShare = (rawWeights[category] ?? DEFAULT_CATEGORY_WEIGHT) / weightSum;
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

  const sumAllocated = items.reduce((sum, item) => sum + item.allocatedAmount, 0);
  const diff = context.totalBudget - sumAllocated;
  const first = items[0];
  if (diff !== 0 && first) {
    first.allocatedAmount += diff;
    if (simulatedOverrunRatio === 1.0) {
      first.projectedAmount += diff;
    }
  }

  return items;
}

/**
 * Merges updated context into existing budget items, preserving user-edited amounts and verified locks.
 */
export function mergeBudgetAllocations(
  context: EventContext,
  existingItems: ReadonlyArray<BudgetCategoryItem>
): BudgetCategoryItem[] {
  const freshItems = buildInitialBudgetItems(context, 1.0);
  const existingMap = new Map(existingItems.map((item) => [item.category, item]));

  return freshItems.map((fresh) => {
    const existing = existingMap.get(fresh.category);
    if (!existing) {
      return fresh;
    }
    return {
      ...fresh,
      id: existing.id,
      projectedAmount: existing.isVerifiedQuote ? existing.projectedAmount : fresh.allocatedAmount,
      isVerifiedQuote: existing.isVerifiedQuote,
    };
  });
}

const MUST_HAVE_PATTERNS: Partial<Record<BudgetCategoryName, RegExp>> = {
  'Catering & Hospitality': /food|catering|feast|buffet|cake/i,
  'Venue & Logistics': /venue|stage|mandap|hall|lawn/i,
  'Decor & Ambience': /decor|floral|flower|light/i,
  'Photography & Media': /photo|video|drone|album|shoot/i,
  'Entertainment & Rituals': /dj|music|band|ritual|singer/i,
};

export function isProtectedByMustHaves(
  category: BudgetCategoryName,
  mustHaves: readonly string[]
): boolean {
  if (mustHaves.length === 0) return false;
  const pattern = MUST_HAVE_PATTERNS[category];
  return pattern ? pattern.test(mustHaves.join(' ')) : false;
}
