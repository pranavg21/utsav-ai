/**
 * @fileoverview Zod runtime validation schemas and native JSON schemas for Gemini 2.5 Flash structured output.
 */

import { z } from 'zod';

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

export const AiChangeRequestResponseSchema = z.object({
  changeType: z.enum(['guest_count', 'budget_shift', 'timeline_delay', 'vendor_switch', 'scope_tradeoff']),
  targetCategory: z.string().optional(),
  amountDelta: z.number().optional(),
  guestDelta: z.number().optional(),
  targetDaysDelta: z.number().optional(),
  sentiment: z.number().min(-1).max(1),
  reasoning: z.string(),
});

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

export const AiVendorQuoteExtractionSchema = z.object({
  vendorName: z.string(),
  category: z.string(),
  quotedPrice: z.number().nonnegative(),
  guestCapacity: z.number().int().positive(),
  inclusions: z.array(z.string()),
  hiddenRisks: z.array(z.string()),
  negotiationPoints: z.array(z.string()),
});

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

export const AiPersonalizedIdeasResponseSchema = z.array(AiPersonalizedConceptSchema);

export type AiPlanResponse = z.infer<typeof AiPlanResponseSchema>;
export type AiChangeRequestResponse = z.infer<typeof AiChangeRequestResponseSchema>;
export type AiVendorChecklistResponse = z.infer<typeof AiVendorChecklistResponseSchema>;
export type AiVendorQuoteExtraction = z.infer<typeof AiVendorQuoteExtractionSchema>;

