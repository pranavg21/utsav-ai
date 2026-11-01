/**
 * @fileoverview Normalizer for AI-extracted raw vendor quotes.
 */

import type { BudgetCategoryName, VendorQuote } from '../../types/planner';
import type { ProvenanceBadgeData } from '../../types/plannerExtended';
import { isBudgetCategoryName } from '../../utils/typeGuards';
import { calculateAllInCost } from './normalize';

export interface RawExtractedQuoteData {
  readonly vendorName: string;
  readonly category: string;
  readonly quotedPrice: number;
  readonly guestCapacity: number;
  readonly inclusions: readonly string[];
  readonly hiddenRisks: readonly string[];
  readonly negotiationPoints: readonly string[];
}

export interface NormalizeQuoteOptions {
  readonly rawText: string;
  readonly category: BudgetCategoryName;
  readonly defaultGuests: number;
  readonly provenance: ProvenanceBadgeData;
}

/** Upper ceiling below which an extracted unit quote is interpreted as per-person rate. */
const PER_UNIT_RATE_CEILING = 15000;

function resolveExtractedPricing(
  quotedPrice: number,
  isPerUnit: boolean,
  guestCapacity: number
): { readonly price: number; readonly perUnit?: number | undefined } {
  const isSmallUnit = quotedPrice > 0 && quotedPrice < PER_UNIT_RATE_CEILING;
  if (isPerUnit) {
    if (isSmallUnit) {
      return { price: quotedPrice * guestCapacity, perUnit: quotedPrice };
    }
    return { price: quotedPrice, perUnit: Math.round(quotedPrice / guestCapacity) };
  }
  return { price: quotedPrice };
}

function resolveExtractedRisks(
  extractedRisks: readonly string[],
  rawText: string,
  price: number
): string[] {
  const risks = [...extractedRisks];
  if (/extra|additional|surcharge|not included|excluded/i.test(rawText) && !risks.some((r) => /extra|surcharge/i.test(r))) {
    risks.push('Potential extra charges detected in quote text');
  }
  if (price === 0 && !risks.some((r) => /no price/i.test(r))) {
    risks.push('No price disclosed in quote text — flagged for missing pricing');
  }
  return risks;
}

export function normalizeExtractedQuote(
  extracted: RawExtractedQuoteData,
  options: NormalizeQuoteOptions
): VendorQuote {
  const { rawText, category, defaultGuests, provenance } = options;
  const isPerUnit = /per\s+(?:plate|head|pax|person)|\/(?:plate|head|pax|person)\b/i.test(rawText);
  const guestCapacity = extracted.guestCapacity > 0 ? extracted.guestCapacity : defaultGuests;
  const pricing = resolveExtractedPricing(extracted.quotedPrice, isPerUnit, guestCapacity);
  const hiddenRisks = resolveExtractedRisks(extracted.hiddenRisks, rawText, pricing.price);

  const clarificationQuestions = extracted.negotiationPoints.length > 0
    ? [...extracted.negotiationPoints]
    : [pricing.price === 0 ? 'Request formal baseline price card or quote' : 'Confirm final all-inclusive price with GST'];

  const baseQuote: VendorQuote = {
    id: `vq-ai-${Date.now()}`,
    vendorName: extracted.vendorName || 'Custom Vendor (AI Parsed)',
    category: isBudgetCategoryName(extracted.category) ? extracted.category : category,
    quotedPrice: pricing.price,
    guestCapacity,
    isVerifiedQuote: false,
    inclusions: extracted.inclusions.length > 0 ? [...extracted.inclusions] : ['Extracted quote package'],
    hiddenRisks,
    clarificationQuestions,
    ...(pricing.perUnit !== undefined && { perUnitPrice: pricing.perUnit }),
    provenance,
  };

  const allIn = calculateAllInCost(baseQuote, guestCapacity);
  return { ...baseQuote, allInCost: allIn.allInCost };
}
