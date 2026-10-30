/**
 * @fileoverview Vendor quote comparison, normalizer, and all-in cost calculation with GST.
 */

import type { BudgetCategoryName, EventContext, VendorQuote } from '../../types/planner';

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

export function calculateAllInCost(
  quote: VendorQuote,
  guestCount: number,
  options?: { readonly headcountBuffer?: number; readonly gstRate?: number }
): AllInCostBreakdown {
  const buffer = options?.headcountBuffer ?? 0.15;
  const gstRate = options?.gstRate ?? (quote.category === 'Catering & Hospitality' ? 0.05 : 0.18);
  const isPerPlate = quote.quotedPrice > 0 && quote.quotedPrice < 5000;
  const effectiveGuests = isPerPlate ? Math.round(guestCount * (1 + buffer)) : 1;
  const baseAmount = isPerPlate ? quote.quotedPrice * effectiveGuests : quote.quotedPrice;
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

export function analyzeRawQuoteText(rawText: string, category: BudgetCategoryName): VendorQuote {
  const priceMatch = rawText.match(/₹\s?([\d,]+)/);
  const priceStr = priceMatch?.[1] ?? '0';
  const extractedPrice = parseInt(priceStr.replace(/,/g, ''), 10);
  const guestMatch = rawText.match(/(\d+)\s*(?:guests?|pax|people|persons?)/i);
  const guestStr = guestMatch?.[1] ?? '0';
  const extractedCapacity = parseInt(guestStr, 10);
  const hasHiddenCharge = /extra|additional|surcharge|not included|excluded/i.test(rawText);

  return {
    id: `vq-custom-${Date.now()}`,
    vendorName: 'Custom Vendor (Parsed)',
    category,
    quotedPrice: extractedPrice,
    guestCapacity: extractedCapacity,
    isVerifiedQuote: false,
    inclusions: ['Parsed from pasted text — verify with vendor'],
    hiddenRisks: hasHiddenCharge ? ['Potential extra charges detected in quote text'] : [],
    clarificationQuestions: [
      'Confirm final all-inclusive price with GST',
      'Verify guest capacity and per-head overage rates',
      'Request itemized breakdown of inclusions',
    ],
  };
}
