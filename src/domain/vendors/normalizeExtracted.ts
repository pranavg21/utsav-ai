/**
 * @fileoverview Normalizer for AI-extracted raw vendor quotes.
 */

import type { BudgetCategoryName, VendorQuote } from '../../types/planner';
import type { ProvenanceBadgeData } from '../../types/plannerExtended';
import { isBudgetCategoryName } from '../../utils/typeGuards';
import { calculateAllInCost } from './normalize';

/** Raw quote extraction payload received from GenAI vendor extraction model. */
export interface RawExtractedQuoteData {
  readonly vendorName: string;
  readonly category: string;
  readonly quotedPrice: number;
  readonly guestCapacity: number;
  readonly inclusions: readonly string[];
  readonly hiddenRisks: readonly string[];
  readonly negotiationPoints: readonly string[];
}

/** Options for normalizing raw extracted quotes against celebration context. */
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

/**
 * Normalizes an AI-extracted quote data object into a typed VendorQuote with all-in costs.
 * @param extracted Structured data extracted from quote text by Gemini.
 * @param options Contextual fallback options including provenance and default guests.
 * @returns Fully normalized VendorQuote entity.
 */
export function normalizeExtractedQuote(
  extracted: RawExtractedQuoteData,
  options: NormalizeQuoteOptions
): VendorQuote {
  const { rawText, category: fallbackCategory, defaultGuests, provenance } = options;
  const isPerUnit = /per\s+(?:plate|head|pax|person)|\/(?:plate|head|pax|person)\b/i.test(rawText);
  const guestCapacity = extracted.guestCapacity > 0 ? extracted.guestCapacity : defaultGuests;
  const pricing = resolveExtractedPricing(extracted.quotedPrice, isPerUnit, guestCapacity);
  const quotedPrice = pricing.price;
  const perUnitPrice = pricing.perUnit;
  const hiddenRisks = resolveExtractedRisks(extracted.hiddenRisks, rawText, quotedPrice);
  const finalCategory = isBudgetCategoryName(extracted.category) ? extracted.category : fallbackCategory;

  const baseQuote: VendorQuote = {
    id: `vq-ai-${Date.now()}`,
    vendorName: extracted.vendorName.trim() || 'Custom Vendor (AI Parsed)',
    category: finalCategory,
    quotedPrice,
    guestCapacity,
    isVerifiedQuote: false,
    inclusions: extracted.inclusions.length > 0 ? [...extracted.inclusions] : ['Parsed with Gemini — review terms'],
    hiddenRisks,
    clarificationQuestions:
      extracted.negotiationPoints.length > 0
        ? [...extracted.negotiationPoints]
        : [
            quotedPrice === 0
              ? 'Request formal baseline price card or quote'
              : 'Confirm final all-inclusive price with GST',
            'Verify guest capacity and per-head overage rates',
            'Request itemized breakdown of inclusions',
          ],
    ...(perUnitPrice !== undefined && { perUnitPrice }),
  };

  const allIn = calculateAllInCost(baseQuote, guestCapacity);
  return {
    ...baseQuote,
    allInCost: allIn.allInCost,
    provenance,
  };
}
