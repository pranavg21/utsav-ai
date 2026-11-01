/**
 * @fileoverview Baseline budget category share distributions per celebration occasion vertical.
 */

import type { BudgetCategoryName, OccasionType } from '../../types/planner';
import { SHARE_SUM_TOLERANCE, TARGET_TOTAL_SHARE } from '../shared/constants';

/** Baseline category budget percentage shares for Indian weddings. */
export const WEDDING_CATEGORY_SHARES: Record<BudgetCategoryName, number> = {
  'Venue & Logistics': 0.26,
  'Catering & Hospitality': 0.32,
  'Decor & Ambience': 0.16,
  'Photography & Media': 0.1,
  'Entertainment & Rituals': 0.08,
  'Contingency Reserve': 0.08,
};

/** Default fallback category share distribution (wedding). */
export const BASE_CATEGORY_SHARES = WEDDING_CATEGORY_SHARES;

/** Baseline category budget percentage shares for milestone birthdays. */
export const BIRTHDAY_CATEGORY_SHARES: Record<BudgetCategoryName, number> = {
  'Venue & Logistics': 0.15,
  'Catering & Hospitality': 0.35,
  'Decor & Ambience': 0.15,
  'Photography & Media': 0.1,
  'Entertainment & Rituals': 0.2,
  'Contingency Reserve': 0.05,
};

/** Baseline category budget percentage shares for community festivals and gatherings. */
export const COMMUNITY_CATEGORY_SHARES: Record<BudgetCategoryName, number> = {
  'Venue & Logistics': 0.2,
  'Catering & Hospitality': 0.2,
  'Decor & Ambience': 0.25,
  'Photography & Media': 0.05,
  'Entertainment & Rituals': 0.2,
  'Contingency Reserve': 0.1,
};

/**
 * Retrieves the baseline category budget share distribution for a celebration occasion.
 * @param occasion Celebration occasion vertical.
 * @returns Map of budget categories to their fractional share (summing to 1.0).
 */
export function getCategorySharesForOccasion(occasion: OccasionType): Record<BudgetCategoryName, number> {
  switch (occasion) {
    case 'wedding':
      return WEDDING_CATEGORY_SHARES;
    case 'birthday':
      return BIRTHDAY_CATEGORY_SHARES;
    case 'community':
      return COMMUNITY_CATEGORY_SHARES;
  }
}

/**
 * Validates that category shares sum up to 100% within numeric tolerance.
 * @param shares Category share mapping.
 * @returns True if sum equals 1.0 within tolerance.
 */
export function isShareSumNormalized(shares: Record<BudgetCategoryName, number>): boolean {
  const sum = Object.values(shares).reduce((acc, v) => acc + v, 0);
  return Math.abs(sum - TARGET_TOTAL_SHARE) <= SHARE_SUM_TOLERANCE;
}
