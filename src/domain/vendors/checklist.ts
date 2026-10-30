/**
 * @fileoverview Vendor checklist domain operations. Synchronizes checklist deadlines with DAG timeline,
 * updates booking prices, and enforces validation rules.
 */

import type { OccasionType } from '../../types/planner';
import type { TimelineTask } from '../../types/plannerExtended';
import type { VendorChecklistItem, VendorChecklistStatus, VendorChecklistSummary } from './types';
import { WEDDING_VENDOR_TEMPLATES } from './templates';
import { BIRTHDAY_VENDOR_TEMPLATES } from './templatesBirthday';
import { COMMUNITY_VENDOR_TEMPLATES } from './templatesCommunity';

export * from './types';

/**
 * Returns default template vendor checklist for a given celebration occasion.
 */
export function getVendorChecklistTemplates(occasion: OccasionType): readonly VendorChecklistItem[] {
  switch (occasion) {
    case 'wedding':
      return WEDDING_VENDOR_TEMPLATES;
    case 'birthday':
      return BIRTHDAY_VENDOR_TEMPLATES;
    case 'community':
      return COMMUNITY_VENDOR_TEMPLATES;
  }
}

/**
 * Propagates timeline delays into linked vendor checklist due dates.
 */
export function syncChecklistWithTimeline(
  checklist: readonly VendorChecklistItem[],
  tasks: readonly TimelineTask[]
): readonly VendorChecklistItem[] {
  const taskMap = new Map<string, number>();
  for (const task of tasks) {
    taskMap.set(task.id, task.daysBeforeEvent);
  }

  return checklist.map((item) => {
    const taskDays = taskMap.get(item.linkedTaskId);
    if (taskDays === undefined) return item;
    return { ...item, dueDaysBeforeEvent: taskDays };
  });
}

function isBookedStatus(status: VendorChecklistStatus): boolean {
  return status === 'booked' || status === 'paid-advance' || status === 'confirmed';
}

function resolvePrice(
  item: VendorChecklistItem,
  overridePrice?: number | undefined
): number | undefined {
  if (overridePrice !== undefined) return overridePrice;
  return item.bookedPrice ?? item.estimatedCost;
}

function mergeChecklistItem(
  item: VendorChecklistItem,
  newStatus: VendorChecklistStatus,
  options?: {
    readonly advancePaid?: number | undefined;
    readonly bookedPrice?: number | undefined;
    readonly isVerifiedQuote?: boolean | undefined;
  }
): VendorChecklistItem {
  const isBooked = isBookedStatus(newStatus);
  const isVerified = options?.isVerifiedQuote ?? (isBooked || item.isVerifiedQuote);
  const advancePaid = options?.advancePaid ?? item.advancePaid;
  const bookedPrice = resolvePrice(item, options?.bookedPrice);

  return {
    ...item,
    status: newStatus,
    isVerifiedQuote: isVerified,
    ...(advancePaid !== undefined ? { advancePaid } : {}),
    ...(bookedPrice !== undefined ? { bookedPrice } : {}),
  };
}

/**
 * Updates a checklist item's status, booked price, and verification flag with boundary checks.
 */
export function updateChecklistItem(
  checklist: readonly VendorChecklistItem[],
  itemId: string,
  newStatus: VendorChecklistStatus,
  options?: {
    readonly advancePaid?: number | undefined;
    readonly bookedPrice?: number | undefined;
    readonly isVerifiedQuote?: boolean | undefined;
  }
): readonly VendorChecklistItem[] {
  return checklist.map((item) => (item.id === itemId ? mergeChecklistItem(item, newStatus, options) : item));
}

/**
 * Computes status and financial rollup metrics across the vendor checklist.
 */
export function calculateChecklistSummary(
  checklist: readonly VendorChecklistItem[],
  daysUntilEvent: number
): VendorChecklistSummary {
  let bookedCount = 0;
  let overdueCount = 0;
  let totalAdvancePaid = 0;
  let totalBookedAmount = 0;

  for (const item of checklist) {
    if (isBookedStatus(item.status)) {
      bookedCount += 1;
      if (item.bookedPrice) totalBookedAmount += item.bookedPrice;
      if (item.advancePaid) totalAdvancePaid += item.advancePaid;
    } else if (item.dueDaysBeforeEvent > daysUntilEvent) {
      overdueCount += 1;
    }
  }

  return {
    totalItems: checklist.length,
    bookedCount,
    overdueCount,
    totalAdvancePaid,
    totalBookedAmount,
  };
}

/**
 * Identifies unbooked critical vendors whose target hiring deadline is already in the past.
 */
export function getOverdueVendors(
  checklist: readonly VendorChecklistItem[],
  daysUntilEvent: number
): readonly VendorChecklistItem[] {
  return checklist.filter((item) => {
    const isPending = item.status === 'not-started' || item.status === 'shortlisted' || item.status === 'quoted';
    return isPending && item.dueDaysBeforeEvent > daysUntilEvent;
  });
}
