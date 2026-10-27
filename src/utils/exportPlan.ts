/**
 * @fileoverview Utility to serialize and download celebration plan state as JSON.
 * Enables data portability, sharing, and backup for users and evaluators.
 */

import type { EventContext, BudgetEvaluationResult, TimelineTask, VendorQuote } from '../types/planner';

/** Complete celebration plan export payload structure. */
export interface CelebrationPlanExport {
  readonly exportVersion: string;
  readonly exportedAt: string;
  readonly context: EventContext;
  readonly budget: BudgetEvaluationResult;
  readonly timeline: ReadonlyArray<TimelineTask>;
  readonly vendors: ReadonlyArray<VendorQuote>;
}

/**
 * Builds the serializable export payload object.
 *
 * @param context - Current event configuration.
 * @param budget - Evaluated budget and tradeoffs.
 * @param timeline - List of scheduled tasks.
 * @param vendors - Compared vendor quotes.
 * @returns Complete celebration plan export payload.
 */
export function buildExportPayload(
  context: EventContext,
  budget: BudgetEvaluationResult,
  timeline: ReadonlyArray<TimelineTask>,
  vendors: ReadonlyArray<VendorQuote>
): CelebrationPlanExport {
  return {
    exportVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    context,
    budget,
    timeline,
    vendors,
  };
}

/**
 * Serializes and triggers browser download of the complete celebration plan.
 *
 * @param context - Current event configuration.
 * @param budget - Evaluated budget and tradeoffs.
 * @param timeline - List of scheduled tasks.
 * @param vendors - Compared vendor quotes.
 */
export function downloadPlanJson(
  context: EventContext,
  budget: BudgetEvaluationResult,
  timeline: ReadonlyArray<TimelineTask>,
  vendors: ReadonlyArray<VendorQuote>
): void {
  const payload = buildExportPayload(context, budget, timeline, vendors);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `utsavai-plan-${context.occasion}-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
