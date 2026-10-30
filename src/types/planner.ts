/**
 * @fileoverview Core TypeScript domain definitions for UtsavAI Celebration & Event Execution Engine.
 * Enforces strict typing for diagnostic intake, priority-weighted budgets, DAG timelines, and vendor quotes.
 */

/** Supported celebration verticals with tailored execution templates. */
export type OccasionType = 'wedding' | 'birthday' | 'community';

/** Experience tier governing per-guest baseline cost assumptions. */
export type ExperienceTier = 'intimate' | 'balanced' | 'grand';

/** Core budget categories tracked across the event lifecycle. */
export type BudgetCategoryName =
  | 'Venue & Logistics'
  | 'Catering & Hospitality'
  | 'Decor & Ambience'
  | 'Photography & Media'
  | 'Entertainment & Rituals'
  | 'Contingency Reserve';

/** Guest age groups for multi-generational personalization. */
export type AgeGroupSegment = 'children' | 'adults' | 'seniors';

/** Execution status for dependency-linked timeline tasks. */
export type TaskStatus = 'pending' | 'completed' | 'delayed';

/**
 * Diagnostic context captured before generating or revising an event plan.
 */
export interface EventContext {
  /** Selected event vertical. */
  readonly occasion: OccasionType;
  /** Display name or title of the celebration. */
  readonly eventName: string;
  /** Total target budget in INR (₹). */
  readonly totalBudget: number;
  /** Expected total guest headcount. */
  readonly guestCount: number;
  /** Days remaining until the event date. */
  readonly daysUntilEvent: number;
  /** Desired ambience and scale tier. */
  readonly experienceTier: ExperienceTier;
  /** Ordered list of categories from highest user priority (index 0) to lowest. */
  readonly priorityRanking: BudgetCategoryName[];
  /** Active demographic segments attending the event. */
  readonly ageGroups: AgeGroupSegment[];
  /** Specific accessibility, dietary, or mobility requirements. */
  readonly accessibilityNeeds: string[];
  /** Non-negotiable elements that must be protected during budget trade-offs. */
  readonly mustHaves: string[];
}

/**
 * Represents a single budget category line item with explicit hallucination guardrails.
 */
export interface BudgetCategoryItem {
  /** Unique identifier for the category row. */
  readonly id: string;
  /** Standardized category name. */
  readonly category: BudgetCategoryName;
  /** Initial target allocation in INR (₹). */
  allocatedAmount: number;
  /** Current projected or quoted spend in INR (₹). */
  projectedAmount: number;
  /**
   * Hallucination guardrail flag:
   * false = AI Estimated Assumption; true = Verified Vendor Quote confirmed by user.
   */
  isVerifiedQuote: boolean;
  /** Priority weight from 1 (lowest) to 6 (highest) derived from user ranking. */
  readonly priorityWeight: number;
  /** Clear explanation of how this figure was calculated or adjusted. */
  rationale: string;
}

/**
 * Represents a priority-aligned trade-off option when projected expenses exceed budget.
 */
export interface TradeOffScenario {
  /** Unique identifier for the scenario option. */
  readonly id: string;
  /** Human-readable strategy title (e.g., "Protect Catering, Simplify Floral Decor"). */
  readonly title: string;
  /** Summary of who this option serves best. */
  readonly strategySummary: string;
  /** Total projected spend after applying this trade-off in INR (₹). */
  readonly revisedTotalSpend: number;
  /** Total amount saved compared to the overrun projection in INR (₹). */
  readonly totalSavings: number;
  /** Whether the trade-off fully resolves the overrun without breaking category floors. */
  readonly isFeasible?: boolean | undefined;
  /** Additional funds required if trade-off cannot fully absorb the overrun in INR. */
  readonly requiredAdditionalFunds?: number | undefined;
  /** Category-by-category adjustments showing exact rupee deltas. */
  readonly categoryAdjustments: ReadonlyArray<{
    readonly category: BudgetCategoryName;
    readonly previousAmount: number;
    readonly revisedAmount: number;
    readonly deltaAmount: number;
    readonly actionNote: string;
  }>;
}

/**
 * Complete budget evaluation report returned by the trade-off engine.
 */
export interface BudgetEvaluationResult {
  /** Total target budget in INR (₹). */
  readonly totalBudget: number;
  /** Sum of all current projected category amounts in INR (₹). */
  readonly totalProjected: number;
  /** Rupee variance (positive means overrun, negative or zero means within budget). */
  readonly overrunAmount: number;
  /** Percentage overrun relative to totalBudget (e.g., 20 means +20% over budget). */
  readonly overrunPercentage: number;
  /** True if totalProjected exceeds totalBudget. */
  readonly isOverBudget: boolean;
  /** Updated category items with normalized weights. */
  readonly items: ReadonlyArray<BudgetCategoryItem>;
  /** Three distinct priority-respecting trade-off options when over budget. */
  readonly tradeOffScenarios: ReadonlyArray<TradeOffScenario>;
}

export interface CelebrationPreset {
  readonly id: string;
  readonly title: string;
  readonly context: EventContext;
}

/* Re-export extended types for backwards-compatible single-file imports. */
export type {
  TimelineTask,
  VendorQuote,
  ChangeRequestInput,
  PersonalizedConcept,
} from './plannerExtended';
