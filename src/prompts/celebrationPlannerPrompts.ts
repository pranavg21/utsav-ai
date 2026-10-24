/**
 * @fileoverview Structured prompt templates for Gemini LLM integration.
 * Provides deterministic prompt builders for change request parsing,
 * vendor quote analysis, and personalized theme generation.
 */

import type { EventContext, BudgetCategoryName } from '../types/planner';

/**
 * Builds a structured prompt for parsing natural-language change requests
 * and synthesizing ripple-effect impacts across budget, timeline, and guests.
 *
 * @param context - Current event diagnostic context.
 * @param changePrompt - Raw natural language change description from user.
 * @returns Formatted prompt string for Gemini structured JSON output.
 */
export function buildChangeRequestPrompt(context: EventContext, changePrompt: string): string {
  return `You are an expert Indian event planner AI. Analyze this change request for a ${context.occasion} event.

EVENT CONTEXT:
- Budget: ₹${context.totalBudget.toLocaleString('en-IN')}
- Guests: ${context.guestCount}
- Days Until Event: ${context.daysUntilEvent}
- Top Priorities: ${context.priorityRanking.slice(0, 3).join(', ')}

CHANGE REQUEST: "${changePrompt}"

Respond ONLY with valid JSON matching this schema:
{
  "guestDelta": number | null,
  "budgetDeltaPercent": number | null,
  "timelineDeltaDays": number | null,
  "impactSummary": "string describing cascading effects",
  "recommendedActions": ["action1", "action2", "action3"]
}`;
}

/**
 * Builds a prompt for extracting structured data from raw vendor quote text.
 *
 * @param rawQuoteText - Unstructured vendor quote pasted by user.
 * @param category - The budget category this quote relates to.
 * @returns Formatted prompt string for Gemini vendor quote parsing.
 */
export function buildVendorQuoteParsePrompt(
  rawQuoteText: string,
  category: BudgetCategoryName
): string {
  return `Extract structured vendor quote data from this text for the "${category}" category.

RAW QUOTE TEXT:
"${rawQuoteText}"

Respond ONLY with valid JSON:
{
  "vendorName": "string",
  "quotedPrice": number,
  "guestCapacity": number,
  "inclusions": ["item1", "item2"],
  "hiddenRisks": ["risk1", "risk2"],
  "clarificationQuestions": ["question1", "question2"]
}`;
}

/**
 * Builds a prompt for generating multi-generational personalized theme concepts.
 *
 * @param context - Current event diagnostic context.
 * @returns Formatted prompt string for Gemini theme generation.
 */
export function buildThemeGenerationPrompt(context: EventContext): string {
  const perGuestBudget = Math.round(context.totalBudget / Math.max(1, context.guestCount));
  return `Generate 3 culturally-aware celebration theme concepts for:

EVENT: ${context.occasion} "${context.eventName}"
- Budget: ₹${context.totalBudget.toLocaleString('en-IN')} (₹${perGuestBudget}/guest)
- Guests: ${context.guestCount} (Age groups: ${context.ageGroups.join(', ')})
- Tier: ${context.experienceTier}
- Accessibility: ${context.accessibilityNeeds.join(', ') || 'None specified'}
- Must-haves: ${context.mustHaves.join(', ') || 'None specified'}

Respond ONLY with valid JSON array of 3 concepts:
[{
  "title": "string",
  "estimatedCostFit": "Well Within Budget" | "Moderate Stretch" | "Requires Trade-Off",
  "atmosphereSummary": "string",
  "multiGenerationalAdaptations": {
    "children": "string",
    "seniors": "string",
    "accessibility": "string"
  },
  "budgetFriendlyAlternative": "string"
}]`;
}
