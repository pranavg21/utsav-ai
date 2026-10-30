/**
 * @fileoverview Structured prompt templates for Gemini 2.5 Flash execution.
 * User inputs are safely JSON-delimited to prevent prompt injection and delimiter collision.
 */

import type { EventContext, BudgetCategoryName } from '../types/planner';

/**
 * Builds structured prompt for intake plan generation.
 */
export function buildPlanGenerationPrompt(context: EventContext): string {
  const serializedContext = JSON.stringify({
    occasion: context.occasion,
    eventName: context.eventName,
    totalBudget: context.totalBudget,
    guestCount: context.guestCount,
    daysUntilEvent: context.daysUntilEvent,
    experienceTier: context.experienceTier,
    priorityRanking: context.priorityRanking,
    mustHaves: context.mustHaves,
  });

  return `Generate an execution plan for this Indian event.
INPUT_CONTEXT_JSON: ${serializedContext}

Output JSON with budgetAllocations, subEvents, and timelineTasks. Never invent confirmed vendor pricing; label all amounts as estimates.`;
}

/**
 * Builds structured prompt for natural-language change requests.
 */
export function buildChangeRequestPrompt(context: EventContext, changePrompt: string): string {
  const payload = JSON.stringify({
    occasion: context.occasion,
    totalBudget: context.totalBudget,
    guestCount: context.guestCount,
    daysUntilEvent: context.daysUntilEvent,
    userRequest: changePrompt,
  });

  return `Parse this event change request and quantify ripple effects.
USER_REQUEST_JSON: ${payload}

Classify changeType, compute deltas, assess sentiment (-1.0 to 1.0), and explain cascade reasoning.`;
}

/**
 * Builds structured prompt for occasion-specific vendor checklists.
 */
export function buildVendorChecklistPrompt(context: EventContext): string {
  const payload = JSON.stringify({
    occasion: context.occasion,
    totalBudget: context.totalBudget,
    guestCount: context.guestCount,
    daysUntilEvent: context.daysUntilEvent,
  });

  return `Generate mandatory vendor checklist items for this ${context.occasion} event.
EVENT_METRICS_JSON: ${payload}

For each vendor, specify mustAsk screening questions, required legal/sanction documents, and target due days before event.`;
}

/**
 * Builds structured prompt for vendor quote extraction.
 */
export function buildVendorQuoteParsePrompt(
  rawQuoteText: string,
  category: BudgetCategoryName
): string {
  const payload = JSON.stringify({
    targetCategory: category,
    rawQuoteText,
  });

  return `Extract structured quotation terms from this vendor quote text.
QUOTE_DATA_JSON: ${payload}

Extract vendorName, category, quotedPrice, guestCapacity, inclusions, hiddenRisks, and negotiationPoints.`;
}

/**
 * Builds structured prompt for multi-generational theme ideas.
 */
export function buildThemeGenerationPrompt(context: EventContext): string {
  const payload = JSON.stringify({
    occasion: context.occasion,
    totalBudget: context.totalBudget,
    guestCount: context.guestCount,
    ageGroups: context.ageGroups,
    accessibilityNeeds: context.accessibilityNeeds,
    mustHaves: context.mustHaves,
  });

  return `Generate creative multi-generational celebration concepts for this event.
INPUT_METRICS_JSON: ${payload}

Provide cultural significance, estimatedCostFit, ageGroupAdaptations (children, seniors, general), and budget-friendly alternatives.`;
}
