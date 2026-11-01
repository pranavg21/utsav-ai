/**
 * @fileoverview Memoized selectors for evaluating budgets, bottlenecks, category maps, and vendor checklists.
 */

import type { PlanState } from './planReducer';
import type { BudgetEvaluationResult, TimelineTask } from '../types/planner';
import { evaluateBudgetAndTradeoffs } from '../domain/budget/tradeoffs';
import type { VendorChecklistItem, VendorChecklistSummary } from '../domain/vendors/types';
import { calculateChecklistSummary, getOverdueVendors } from '../domain/vendors/checklist';

/**
 * Computes live budget evaluation and trade-off scenarios from current plan state.
 * @param state Current celebration plan state.
 * @returns Budget evaluation result with overrun status and trade-off scenarios.
 */
export function selectEvaluation(state: PlanState): BudgetEvaluationResult {
  return evaluateBudgetAndTradeoffs(state.context, state.budgetItems);
}

/**
 * Derives a lookup map of budget category names to their allocated amounts.
 * @param state Current celebration plan state.
 * @returns Map from category names to allocated amounts.
 */
export function selectCategoryBudgets(state: PlanState): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of state.budgetItems) {
    map[item.category] = item.allocatedAmount;
  }
  return map;
}

/**
 * Filters timeline tasks to identify delayed tasks and critical path bottlenecks.
 * @param state Current celebration plan state.
 * @returns Array of bottleneck or delayed timeline tasks.
 */
export function selectBottlenecks(state: PlanState): TimelineTask[] {
  return state.tasks.filter((t) => t.isBottleneck || t.status === 'delayed');
}

/**
 * Calculates aggregated guest counts and budget percentage shares across all ceremony sub-events.
 * @param state Current celebration plan state.
 * @returns Rollup containing total sub-event guests and combined budget share percentage.
 */
export function selectSubEventRollup(state: PlanState): {
  readonly totalSubEventGuests: number;
  readonly totalSharePercent: number;
} {
  let totalSubEventGuests = 0;
  let totalSharePercent = 0;
  for (const se of state.subEvents) {
    totalSubEventGuests += se.guestCount;
    totalSharePercent += se.budgetSharePercent;
  }
  return { totalSubEventGuests, totalSharePercent };
}

/**
 * Derives aggregate vendor hiring progress metrics and financial commitments.
 * @param state Current celebration plan state.
 * @returns Checklist summary metrics including booked count, advance paid, and overdue count.
 */
export function selectChecklistSummary(state: PlanState): VendorChecklistSummary {
  return calculateChecklistSummary(state.checklist, state.context.daysUntilEvent);
}

/**
 * Selects unbooked vendor items whose hiring deadline has passed relative to event date.
 * @param state Current celebration plan state.
 * @returns Array of overdue vendor checklist items.
 */
export function selectOverdueVendors(state: PlanState): readonly VendorChecklistItem[] {
  return getOverdueVendors(state.checklist, state.context.daysUntilEvent);
}
