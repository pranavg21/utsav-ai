/**
 * @fileoverview Extended domain types for timeline tasks, vendor quotes, change requests,
 * and personalized theme concepts. Split from core planner types for file size compliance.
 */

import type { BudgetCategoryName, TaskStatus } from './planner';

/**
 * Dependency-aware task node in the event execution timeline.
 */
export interface TimelineTask {
  /** Unique task identifier (e.g., "task-venue"). */
  readonly id: string;
  /** Actionable task title. */
  readonly title: string;
  /** Planning phase label. */
  readonly phase: 'Foundation' | 'Vendor Locking' | 'Guest & Logistics' | 'Final Execution';
  /** Target completion deadline measured in days before the event. */
  daysBeforeEvent: number;
  /** Number of days this task has slipped (0 if on schedule). */
  delayDays: number;
  /** Current execution status. */
  status: TaskStatus;
  /** IDs of prerequisite tasks that must finish before this task can finalize. */
  readonly dependsOn: string[];
  /** True if this task is impacted by an upstream delay or compressed timeline. */
  isBottleneck: boolean;
  /** Explanation of downstream ripple impact if delayed. */
  delayImpactNote: string;
  /** Baseline days before event before any delays or shocks. */
  baselineDaysBeforeEvent?: number | undefined;
  /** Own specific delay in days directly assigned to this task. */
  ownDelayDays?: number | undefined;
  /** Flagged true if task deadline drops < 1 day or violates prerequisite order. */
  isInfeasible?: boolean | undefined;
  /** Minimum notice in days required to execute this task without timeline breach. */
  minimumNoticeDays?: number | undefined;
}

/**
 * Structured representation of a vendor quotation for side-by-side comparison.
 */
export interface VendorQuote {
  /** Unique quote identifier. */
  readonly id: string;
  /** Vendor business name. */
  readonly vendorName: string;
  /** Associated budget category. */
  readonly category: BudgetCategoryName;
  /** Total quoted price in INR (₹). */
  readonly quotedPrice: number;
  /** Maximum guest count covered in base quote. */
  readonly guestCapacity: number;
  /** True only when user confirms availability and formal written quotation. */
  isVerifiedQuote: boolean;
  /** Explicitly included deliverables. */
  readonly inclusions: string[];
  /** Potential hidden charges or exclusions flagged by analysis. */
  readonly hiddenRisks: string[];
  /** Recommended questions the user should ask before signing or paying a deposit. */
  readonly clarificationQuestions: string[];
}

/**
 * Natural-language change request payload for the Ripple-Effect Simulator.
 */
export interface ChangeRequestInput {
  /** Raw natural language description of the change. */
  readonly rawPrompt: string;
  /** Optional delta in guest count (e.g., +50). */
  readonly guestDelta?: number | undefined;
  /** Optional percentage shift in user total budget (e.g., -10 for 10% cut). */
  readonly budgetDeltaPercent?: number | undefined;
  /** Optional percentage overrun in vendor/category projected costs (e.g., +20 for 20% cost surge). */
  readonly costOverrunPercent?: number | undefined;
  /** Optional reduction in days until event (e.g., 14 for moving 2 weeks earlier). */
  readonly timelineDeltaDays?: number | undefined;
}

/**
 * Multi-generational and constraint-aware personalized theme concept.
 */
export interface PersonalizedConcept {
  /** Unique concept ID. */
  readonly id: string;
  /** Theme title. */
  readonly title: string;
  /** Estimated cost tier label. */
  readonly estimatedCostFit: 'Well Within Budget' | 'Moderate Stretch' | 'Requires Trade-Off';
  /** Core atmosphere and cultural styling notes. */
  readonly atmosphereSummary: string;
  /** Specific adaptations for children and senior family members. */
  readonly multiGenerationalAdaptations: {
    readonly children: string;
    readonly seniors: string;
    readonly accessibility: string;
  };
  /** Practical low-cost swap if the user finds the initial concept too expensive. */
  readonly budgetFriendlyAlternative: string;
}
