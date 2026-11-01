/**
 * @fileoverview Vendor quote comparison, normalizer, and all-in cost calculation with GST.
 */

import type { BudgetCategoryName, EventContext, VendorQuote } from '../../types/planner';
import {
  DEFAULT_HEADCOUNT_BUFFER,
  GST_RATE_CATERING,
  GST_RATE_GENERAL,
  PER_UNIT_PRICE_THRESHOLD,
} from '../shared/constants';

export { analyzeRawQuoteText } from './parseQuoteText';
export {
  normalizeExtractedQuote,
  type RawExtractedQuoteData,
  type NormalizeQuoteOptions,
} from './normalizeExtracted';

/** Evaluation metrics comparing a vendor quote against event capacity and allocated category budget. */
export interface QuoteComparisonResult {
  readonly quoteId: string;
  readonly vendorName: string;
  readonly isCapacityShortfall: boolean;
  readonly capacityGap: number;
  readonly isBudgetOverrun: boolean;
  readonly budgetDelta: number;
  readonly riskCount: number;
  readonly questionCount: number;
}

/** Detailed cost breakdown including headline, base calculation, GST rate, and all-in cost. */
export interface AllInCostBreakdown {
  readonly headlineQuote: number;
  readonly baseAmount: number;
  readonly gstRate: number;
  readonly gstAmount: number;
  readonly allInCost: number;
}

function resolveGstRate(category: BudgetCategoryName, optRate?: number): number {
  if (optRate !== undefined) {
    return optRate;
  }
  return category === 'Catering & Hospitality' ? GST_RATE_CATERING : GST_RATE_GENERAL;
}

function isPerPlateQuote(quote: VendorQuote): boolean {
  if (quote.perUnitPrice !== undefined && quote.perUnitPrice > 0) {
    return true;
  }
  return quote.quotedPrice > 0 && quote.quotedPrice < PER_UNIT_PRICE_THRESHOLD;
}

/**
 * Calculates comprehensive all-in cost for a vendor quote including buffer and GST.
 * @param quote Vendor quote details including headline price or per-unit rate.
 * @param guestCount Total planned celebration guest headcount.
 * @param options Optional overrides for headcount buffer and GST rate.
 * @returns Breakdown of base amount, GST rate, GST amount, and total all-in cost.
 * @example
 * ```ts
 * const breakdown = calculateAllInCost(quote, 150);
 * // breakdown.allInCost includes base amount + calculated GST
 * ```
 */
export function calculateAllInCost(
  quote: VendorQuote,
  guestCount: number,
  options?: { readonly headcountBuffer?: number; readonly gstRate?: number }
): AllInCostBreakdown {
  const buffer = options?.headcountBuffer ?? DEFAULT_HEADCOUNT_BUFFER;
  const gstRate = resolveGstRate(quote.category, options?.gstRate);
  const isPerPlate = isPerPlateQuote(quote);
  const effectiveGuests = isPerPlate ? Math.round(guestCount * (1 + buffer)) : 1;
  const rate = quote.perUnitPrice ?? quote.quotedPrice;
  const baseAmount = isPerPlate ? rate * effectiveGuests : quote.quotedPrice;
  const gstAmount = Math.round(baseAmount * gstRate);

  return {
    headlineQuote: quote.quotedPrice,
    baseAmount,
    gstRate,
    gstAmount,
    allInCost: baseAmount + gstAmount,
  };
}

/**
 * Compares a vendor quote against event guest count and category budget.
 * @param quote Vendor quote under evaluation.
 * @param context Event context with planned guest count.
 * @param categoryBudget Allocated budget for this vendor category.
 * @returns Quote comparison metrics including budget delta and capacity gap.
 */
export function compareQuoteToContext(
  quote: VendorQuote,
  context: EventContext,
  categoryBudget: number
): QuoteComparisonResult {
  const isCapacityShortfall = quote.guestCapacity < context.guestCount;
  const isBudgetOverrun = quote.quotedPrice > categoryBudget;
  const budgetDelta = quote.quotedPrice - categoryBudget;
  const capacityGap = isCapacityShortfall ? context.guestCount - quote.guestCapacity : 0;

  return {
    quoteId: quote.id,
    vendorName: quote.vendorName,
    isCapacityShortfall,
    capacityGap,
    isBudgetOverrun,
    budgetDelta,
    riskCount: quote.hiddenRisks.length,
    questionCount: quote.clarificationQuestions.length,
  };
}
