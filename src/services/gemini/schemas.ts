/**
 * @fileoverview Zod runtime validation schemas and native JSON schemas for Gemini 2.5 Flash structured output.
 */

import { z } from 'zod';

/** Schema validating Gemini generated full celebration plan response. */
export const AiPlanResponseSchema = z.object({
  budgetAllocations: z.array(
    z.object({
      category: z.string(),
      allocatedAmount: z.number().int().nonnegative(),
      rationale: z.string(),
    })
  ),
  subEvents: z.array(
    z.object({
      name: z.string(),
      dayOffset: z.number().int(),
      guestCount: z.number().int().positive(),
      venueType: z.enum(['home', 'banquet', 'lawn', 'temple', 'destination']),
      budgetSharePercent: z.number().nonnegative(),
    })
  ),
  timelineTasks: z.array(
    z.object({
      title: z.string(),
      phase: z.enum(['Foundation', 'Vendor Locking', 'Guest & Logistics', 'Final Execution']),
      daysBeforeEvent: z.number().int().positive(),
      dependsOn: z.array(z.string()),
    })
  ),
});

/** Schema validating Gemini natural-language change request parsing response. */
export const AiChangeRequestResponseSchema = z.object({
  changeType: z.enum(['guest_count', 'budget_shift', 'timeline_delay', 'vendor_switch', 'scope_tradeoff']),
  targetCategory: z.string().optional().nullable(),
  amountDelta: z.number().optional().nullable(),
  budgetDeltaPercent: z.number().optional().nullable(),
  guestDelta: z.number().optional().nullable(),
  targetDaysDelta: z.number().optional().nullable(),
  costOverrunPercent: z.number().optional().nullable(),
  vendorDelay: z
    .object({
      taskId: z.string(),
      days: z.number(),
    })
    .optional()
    .nullable(),
  sentiment: z.number().min(-1).max(1),
  reasoning: z.string(),
});

/** Schema validating Gemini vendor checklist generation response. */
export const AiVendorChecklistResponseSchema = z.object({
  items: z.array(
    z.object({
      vendorType: z.string(),
      category: z.string(),
      dueDaysBeforeEvent: z.number().int().positive(),
      mustAsk: z.array(z.string()),
      documents: z.array(z.string()),
    })
  ),
});

/** Schema validating Gemini vendor quote information extraction response. */
export const AiVendorQuoteExtractionSchema = z.object({
  vendorName: z.string(),
  category: z.string(),
  quotedPrice: z.number().nonnegative(),
  guestCapacity: z.number().int().positive(),
  inclusions: z.array(z.string()),
  hiddenRisks: z.array(z.string()),
  negotiationPoints: z.array(z.string()),
});

/** Schema validating an individual Gemini generated celebration concept. */
export const AiPersonalizedConceptSchema = z.object({
  title: z.string(),
  description: z.string(),
  culturalSignificance: z.string(),
  estimatedCostFit: z.enum(['Well Within Budget', 'Moderate Stretch', 'Requires Trade-Off']),
  ageGroupAdaptations: z.object({
    children: z.string(),
    seniors: z.string(),
    general: z.string(),
  }),
  budgetFriendlyAlternative: z.string(),
});

/** Schema validating array of personalized concept responses from Gemini. */
export const AiPersonalizedIdeasResponseSchema = z.array(AiPersonalizedConceptSchema);

/** Inferred type for AI celebration plan generation response. */
export type AiPlanResponse = z.infer<typeof AiPlanResponseSchema>;

/** Inferred type for AI change request parsing response. */
export type AiChangeRequestResponse = z.infer<typeof AiChangeRequestResponseSchema>;

/** Inferred type for AI vendor checklist response. */
export type AiVendorChecklistResponse = z.infer<typeof AiVendorChecklistResponseSchema>;

/** Inferred type for AI vendor quote extraction response. */
export type AiVendorQuoteExtraction = z.infer<typeof AiVendorQuoteExtractionSchema>;
