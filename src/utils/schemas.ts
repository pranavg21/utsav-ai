/**
 * @fileoverview Zod runtime schemas for strict request body and payload validation.
 * Protects against malformed data, schema tampering, and unvalidated payloads.
 */

import { z } from 'zod';
import type { EventContext, ChangeRequestInput, VendorQuote } from '../types/planner';

/** Zod schema for OccasionType union. */
export const occasionTypeSchema = z.enum(['wedding', 'birthday', 'community']);

/** Zod schema for ExperienceTier union. */
export const experienceTierSchema = z.enum(['intimate', 'balanced', 'grand']);

/** Zod schema for BudgetCategoryName union. */
export const budgetCategoryNameSchema = z.enum([
  'Venue & Logistics',
  'Catering & Hospitality',
  'Decor & Ambience',
  'Photography & Media',
  'Entertainment & Rituals',
  'Contingency Reserve',
]);

/** Zod schema for AgeGroupSegment union. */
export const ageGroupSegmentSchema = z.enum(['children', 'adults', 'seniors']);

/** Complete Zod validation schema for EventContext. */
export const eventContextSchema = z.object({
  occasion: occasionTypeSchema,
  eventName: z.string().min(1).max(200),
  totalBudget: z.number().int().positive(),
  guestCount: z.number().int().positive(),
  daysUntilEvent: z.number().int().positive(),
  experienceTier: experienceTierSchema,
  priorityRanking: z.array(budgetCategoryNameSchema),
  ageGroups: z.array(ageGroupSegmentSchema),
  accessibilityNeeds: z.array(z.string()),
  mustHaves: z.array(z.string()),
});

/** Complete Zod validation schema for ChangeRequestInput. */
export const changeRequestInputSchema = z.object({
  rawPrompt: z.string().min(1).max(2000),
  guestDelta: z.number().optional(),
  budgetDeltaPercent: z.number().optional(),
  timelineDeltaDays: z.number().optional(),
});

/** Complete Zod validation schema for VendorQuote. */
export const vendorQuoteSchema = z.object({
  id: z.string().min(1),
  vendorName: z.string().min(1).max(200),
  category: budgetCategoryNameSchema,
  quotedPrice: z.number().int().positive(),
  guestCapacity: z.number().int().positive(),
  isVerifiedQuote: z.boolean(),
  inclusions: z.array(z.string()),
  hiddenRisks: z.array(z.string()),
  clarificationQuestions: z.array(z.string()),
});

/**
 * Validates an unknown payload against the EventContext schema.
 *
 * @param input - Data to validate.
 * @returns Validated EventContext.
 */
export function validateEventContext(input: unknown): EventContext {
  return eventContextSchema.parse(input);
}

/**
 * Validates an unknown payload against the ChangeRequestInput schema.
 *
 * @param input - Data to validate.
 * @returns Validated ChangeRequestInput.
 */
export function validateChangeRequest(input: unknown): ChangeRequestInput {
  return changeRequestInputSchema.parse(input);
}

/**
 * Validates an unknown payload against the VendorQuote schema.
 *
 * @param input - Data to validate.
 * @returns Validated VendorQuote.
 */
export function validateVendorQuote(input: unknown): VendorQuote {
  return vendorQuoteSchema.parse(input);
}
