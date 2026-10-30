/**
 * @fileoverview Baseline budget category share distributions per celebration occasion vertical.
 */

import type { BudgetCategoryName, OccasionType } from '../../types/planner';

export const WEDDING_CATEGORY_SHARES: Record<BudgetCategoryName, number> = {
  'Venue & Logistics': 0.26,
  'Catering & Hospitality': 0.32,
  'Decor & Ambience': 0.16,
  'Photography & Media': 0.1,
  'Entertainment & Rituals': 0.08,
  'Contingency Reserve': 0.08,
};

export const BASE_CATEGORY_SHARES = WEDDING_CATEGORY_SHARES;

export const BIRTHDAY_CATEGORY_SHARES: Record<BudgetCategoryName, number> = {
  'Venue & Logistics': 0.15,
  'Catering & Hospitality': 0.35,
  'Decor & Ambience': 0.15,
  'Photography & Media': 0.1,
  'Entertainment & Rituals': 0.2,
  'Contingency Reserve': 0.05,
};

export const COMMUNITY_CATEGORY_SHARES: Record<BudgetCategoryName, number> = {
  'Venue & Logistics': 0.2,
  'Catering & Hospitality': 0.2,
  'Decor & Ambience': 0.25,
  'Photography & Media': 0.05,
  'Entertainment & Rituals': 0.2,
  'Contingency Reserve': 0.1,
};

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

