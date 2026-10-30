/**
 * @fileoverview Memoized selectors for evaluating budgets, bottlenecks, category maps, and vendor checklists.
 */

import type { PlanState } from './planReducer';
import type { BudgetEvaluationResult, TimelineTask } from '../types/planner';
import { evaluateBudgetAndTradeoffs } from '../domain/budget/tradeoffs';
import type { VendorChecklistItem, VendorChecklistSummary } from '../domain/vendors/types';
import { calculateChecklistSummary, getOverdueVendors } from '../domain/vendors/checklist';

export function selectEvaluation(state: PlanState): BudgetEvaluationResult {
  return evaluateBudgetAndTradeoffs(state.context, state.budgetItems);
}

export function selectCategoryBudgets(state: PlanState): Record<string, number> {
  const map: Record<string, number> = {};
  for (const item of state.budgetItems) {
    map[item.category] = item.allocatedAmount;
  }
  return map;
}

export function selectBottlenecks(state: PlanState): TimelineTask[] {
  return state.tasks.filter((t) => t.isBottleneck || t.status === 'delayed');
}

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

export function selectChecklistSummary(state: PlanState): VendorChecklistSummary {
  return calculateChecklistSummary(state.checklist, state.context.daysUntilEvent);
}

export function selectOverdueVendors(state: PlanState): readonly VendorChecklistItem[] {
  return getOverdueVendors(state.checklist, state.context.daysUntilEvent);
}
