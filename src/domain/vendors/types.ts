/**
 * @fileoverview Domain types for vendor checklist items, statuses, and workflow tracking.
 */

import type { BudgetCategoryName } from '../../types/planner';

/** Vendor hiring lifecycle progression status. */
export type VendorChecklistStatus =
  | 'not-started'
  | 'shortlisted'
  | 'quoted'
  | 'booked'
  | 'paid-advance'
  | 'confirmed';

/** Structured vendor checklist item with timeline linkage and verification state. */
export interface VendorChecklistItem {
  readonly id: string;
  readonly vendorType: string;
  readonly category: BudgetCategoryName;
  readonly functionId?: string | undefined;
  readonly status: VendorChecklistStatus;
  readonly dueDaysBeforeEvent: number;
  readonly linkedTaskId: string;
  readonly mustAsk: readonly string[];
  readonly documents: readonly string[];
  readonly advancePaid?: number | undefined;
  readonly isVerifiedQuote: boolean;
  readonly estimatedCost?: number | undefined;
  readonly bookedPrice?: number | undefined;
}

/** Summary rollup of vendor checklist progress. */
export interface VendorChecklistSummary {
  readonly totalItems: number;
  readonly bookedCount: number;
  readonly overdueCount: number;
  readonly totalAdvancePaid: number;
  readonly totalBookedAmount: number;
}

