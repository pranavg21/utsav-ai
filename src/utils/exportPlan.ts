/**
 * @fileoverview Utility to serialize and download celebration plan state as JSON.
 * Enables data portability, sharing, and backup for users and evaluators.
 */

import type {
  EventContext,
  BudgetEvaluationResult,
  TimelineTask,
  VendorQuote,
} from '../types/planner';
import type { VendorChecklistItem } from '../domain/vendors/types';

/** Input bundle for serialization. */
export interface PlanExportData {
  readonly context: EventContext;
  readonly budget: BudgetEvaluationResult;
  readonly timeline: ReadonlyArray<TimelineTask>;
  readonly vendors: ReadonlyArray<VendorQuote>;
  readonly checklist?: ReadonlyArray<VendorChecklistItem> | undefined;
}

/** Complete celebration plan export payload structure. */
export interface CelebrationPlanExport {
  readonly exportVersion: string;
  readonly exportedAt: string;
  readonly context: EventContext;
  readonly budget: BudgetEvaluationResult;
  readonly timeline: ReadonlyArray<TimelineTask>;
  readonly vendors: ReadonlyArray<VendorQuote>;
  readonly checklist: ReadonlyArray<VendorChecklistItem>;
}

/**
 * Builds the serializable export payload object.
 */
export function buildExportPayload(data: PlanExportData): CelebrationPlanExport {
  return {
    exportVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    context: data.context,
    budget: data.budget,
    timeline: data.timeline,
    vendors: data.vendors,
    checklist: data.checklist ?? [],
  };
}

/**
 * Serializes and triggers browser download of the complete celebration plan.
 */
export function downloadPlanJson(data: PlanExportData): void {
  const payload = buildExportPayload(data);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `utsavai-plan-${data.context.occasion}-${Date.now()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
