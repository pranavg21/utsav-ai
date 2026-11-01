/**
 * @fileoverview Vendor quote comparison, normalizer, and all-in cost calculation with GST.
 */

import type { BudgetCategoryName, EventContext, VendorQuote } from '../../types/planner';

export { analyzeRawQuoteText } from './parseQuoteText';
export {
  normalizeExtractedQuote,
  type RawExtractedQuoteData,
  type NormalizeQuoteOptions,
} from './normalizeExtracted';

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
  return category === 'Catering & Hospitality' ? 0.05 : 0.18;
}

function isPerPlateQuote(quote: VendorQuote): boolean {
  if (quote.perUnitPrice !== undefined && quote.perUnitPrice > 0) {
    return true;
  }
  return quote.quotedPrice > 0 && quote.quotedPrice < 5000;
}

export function calculateAllInCost(
  quote: VendorQuote,
  guestCount: number,
  options?: { readonly headcountBuffer?: number; readonly gstRate?: number }
): AllInCostBreakdown {
  const buffer = options?.headcountBuffer ?? 0.15;
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
