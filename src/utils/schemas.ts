/**
 * @fileoverview Zod runtime schemas for strict request body and payload validation.
 * Protects against malformed data, schema tampering, and unvalidated payloads.
 */

import { z } from 'zod';
import type { EventContext, ChangeRequestInput, VendorQuote } from '../types/planner';
import { type Result, okResult, errResult } from '../types/result';

/** Schema validating celebration occasion vertical enumeration. */
export const occasionTypeSchema = z.enum(['wedding', 'birthday', 'community']);

/** Schema validating celebration experience tier enumeration. */
export const experienceTierSchema = z.enum(['intimate', 'balanced', 'grand']);

/** Schema validating standardized celebration budget category names. */
export const budgetCategoryNameSchema = z.enum([
  'Venue & Logistics',
  'Catering & Hospitality',
  'Decor & Ambience',
  'Photography & Media',
  'Entertainment & Rituals',
  'Contingency Reserve',
]);

/** Schema validating celebration attendee demographic age group segments. */
export const ageGroupSegmentSchema = z.enum(['children', 'adults', 'seniors']);

/** Schema validating complete celebration event context. */
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

/** Schema validating change request input payloads. */
export const changeRequestInputSchema = z.object({
  rawPrompt: z.string().min(1).max(2000),
  guestDelta: z.number().optional(),
  budgetDeltaPercent: z.number().optional(),
  costOverrunPercent: z.number().optional(),
  timelineDeltaDays: z.number().optional(),
});

/** Schema validating structured vendor quote records. */
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
 * Validates untrusted input as an EventContext, throwing if invalid.
 * @param input Unknown object.
 * @returns Validated EventContext.
 */
export function validateEventContext(input: unknown): EventContext {
  return eventContextSchema.parse(input);
}

/**
 * Validates untrusted input as a ChangeRequestInput, throwing if invalid.
 * @param input Unknown object.
 * @returns Validated ChangeRequestInput.
 */
export function validateChangeRequest(input: unknown): ChangeRequestInput {
  return changeRequestInputSchema.parse(input);
}

/**
 * Validates untrusted input as a VendorQuote, throwing if invalid.
 * @param input Unknown object.
 * @returns Validated VendorQuote.
 */
export function validateVendorQuote(input: unknown): VendorQuote {
  return vendorQuoteSchema.parse(input);
}

/**
 * Safely parses untrusted input as an EventContext without throwing.
 * @param input Unknown object.
 * @returns Ok with EventContext or Err with validation message.
 */
export function safeValidateEventContext(input: unknown): Result<EventContext, string> {
  const p = eventContextSchema.safeParse(input);
  return p.success ? okResult(p.data) : errResult(p.error.message);
}

/**
 * Safely parses untrusted input as a ChangeRequestInput without throwing.
 * @param input Unknown object.
 * @returns Ok with ChangeRequestInput or Err with validation message.
 */
export function safeValidateChangeRequest(input: unknown): Result<ChangeRequestInput, string> {
  const p = changeRequestInputSchema.safeParse(input);
  return p.success ? okResult(p.data) : errResult(p.error.message);
}

/**
 * Safely parses untrusted input as a VendorQuote without throwing.
 * @param input Unknown object.
 * @returns Ok with VendorQuote or Err with validation message.
 */
export function safeValidateVendorQuote(input: unknown): Result<VendorQuote, string> {
  const p = vendorQuoteSchema.safeParse(input);
  return p.success ? okResult(p.data) : errResult(p.error.message);
}
