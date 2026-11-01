/**
 * @fileoverview Raw quote text parser for extracting prices, capacity, and per-unit costs.
 */

import type { BudgetCategoryName, VendorQuote } from '../../types/planner';
import type { ProvenanceBadgeData } from '../../types/plannerExtended';
import { parseIndianAmountMultiplier } from '../shared/indianNumbers';
import { calculateAllInCost } from './normalize';

function extractMultiplierPrice(rawText: string): number | null {
  const multMatch = rawText.match(
    /(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore|k|L)\b/i
  );
  if (!multMatch?.[1]) {
    return null;
  }
  const val = parseFloat(multMatch[1]);
  const unit = multMatch[2]?.toLowerCase() ?? '';
  return Math.round(val * parseIndianAmountMultiplier(unit));
}

function extractCurrencySymbolPrice(rawText: string): number | null {
  const currMatch = rawText.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d+)?)/i);
  if (!currMatch?.[1]) {
    return null;
  }
  return Math.round(parseFloat(currMatch[1].replace(/,/g, '')));
}

function extractPlainCostPrice(rawText: string): number {
  const plainMatch = rawText.match(/([\d,]+)\s*(?:package|total|cost|quote)/i);
  if (!plainMatch?.[1]) {
    return 0;
  }
  return Math.round(parseFloat(plainMatch[1].replace(/,/g, '')));
}

function extractPriceFromText(rawText: string): number {
  const multPrice = extractMultiplierPrice(rawText);
  if (multPrice !== null) {
    return multPrice;
  }
  const currPrice = extractCurrencySymbolPrice(rawText);
  if (currPrice !== null) {
    return currPrice;
  }
  return extractPlainCostPrice(rawText);
}

function extractGuestCapacity(text: string, defaultGuests: number): number {
  const guestMatch = text.match(/(\d+)\s*(?:guests?|pax|people|persons?)/i);
  if (guestMatch?.[1]) {
    return parseInt(guestMatch[1], 10);
  }
  return defaultGuests;
}

export function analyzeRawQuoteText(
  rawText: string,
  category: BudgetCategoryName,
  defaultGuests = 100,
  provenance?: ProvenanceBadgeData
): VendorQuote {
  const extractedPrice = extractPriceFromText(rawText);
  const guestCapacity = extractGuestCapacity(rawText, defaultGuests);
  const isPerUnit = /per\s+(?:plate|head|pax|person)|\/(?:plate|head|pax|person)\b/i.test(rawText);
  const perUnitPrice = isPerUnit ? extractedPrice : undefined;
  const effectiveGuests = guestCapacity > 0 ? guestCapacity : defaultGuests;
  const quotedPrice = isPerUnit ? extractedPrice * effectiveGuests : extractedPrice;
  const hasHiddenCharge = /extra|additional|surcharge|not included|excluded/i.test(rawText);
  const hiddenRisks: string[] = [];
  if (hasHiddenCharge) {
    hiddenRisks.push('Potential extra charges detected in quote text');
  }
  if (quotedPrice === 0) {
    hiddenRisks.push('No price disclosed in quote text — flagged for missing pricing');
  }

  const baseQuote: VendorQuote = {
    id: `vq-custom-${Date.now()}`,
    vendorName: 'Custom Vendor (Parsed)',
    category,
    quotedPrice,
    guestCapacity: effectiveGuests,
    isVerifiedQuote: false,
    inclusions: ['Parsed from pasted text — verify with vendor'],
    hiddenRisks,
    clarificationQuestions: [
      quotedPrice === 0 ? 'Request formal baseline price card or quote' : 'Confirm final all-inclusive price with GST',
      'Verify guest capacity and per-head overage rates',
      'Request itemized breakdown of inclusions',
    ],
    ...(perUnitPrice !== undefined && { perUnitPrice }),
  };

  const allIn = calculateAllInCost(baseQuote, effectiveGuests);
  return {
    ...baseQuote,
    allInCost: allIn.allInCost,
    ...(provenance ? { provenance } : {}),
  };
}

