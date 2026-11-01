/**
 * @fileoverview Type definitions for usePlan hook return structure.
 */

import type {
  BudgetEvaluationResult,
  CelebrationPreset,
  EventContext,
  TaskStatus,
  TimelineTask,
  TradeOffScenario,
  VendorQuote,
} from '../types/planner';
import type { ChangeRequestInput } from '../types/plannerExtended';
import type { PlanState } from '../state/planReducer';
import type { VendorChecklistItem, VendorChecklistStatus, VendorChecklistSummary } from '../domain/vendors/types';

/** Return signature for the usePlan celebration orchestrator hook. */
export interface UsePlanReturn {
  readonly state: PlanState;
  readonly derived: {
    readonly evaluation: BudgetEvaluationResult;
    readonly categoryBudgets: Record<string, number>;
    readonly bottlenecks: TimelineTask[];
    readonly subEventRollup: { readonly totalSubEventGuests: number; readonly totalSharePercent: number };
    readonly checklistSummary: VendorChecklistSummary;
    readonly overdueVendors: readonly VendorChecklistItem[];
  };
  readonly actions: {
    readonly loadPreset: (preset: CelebrationPreset) => void;
    readonly updateContext: (updates: Partial<EventContext>) => void;
    readonly applyChange: (change: ChangeRequestInput) => void;
    readonly setProjected: (categoryId: string, amount: number) => void;
    readonly toggleVerified: (categoryId: string) => void;
    readonly applyTradeoff: (scenario: TradeOffScenario) => void;
    readonly setTaskStatus: (taskId: string, status: TaskStatus, delayDays?: number) => void;
    readonly addQuote: (quote: VendorQuote) => void;
    readonly toggleQuoteVerified: (quoteId: string) => void;
    readonly updateChecklistStatus: (
      itemId: string,
      status: VendorChecklistStatus,
      options?: { readonly advancePaid?: number | undefined; readonly bookedPrice?: number | undefined }
    ) => void;
    readonly setChecklist: (checklist: readonly VendorChecklistItem[]) => void;
    readonly updateSubEvent: (
      subEventId: string,
      updates: {
        readonly name?: string | undefined;
        readonly guestCount?: number | undefined;
        readonly budgetSharePercent?: number | undefined;
      }
    ) => void;
  };
}
