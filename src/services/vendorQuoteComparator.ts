/**
 * @fileoverview Vendor Quote Comparator and Negotiation Copilot service.
 * Pre-loads realistic Indian vendor quotes per occasion, enables side-by-side comparison,
 * and flags guest capacity shortfalls, budget overruns, hidden risks, and clarification questions.
 */

import type { BudgetCategoryName, EventContext, OccasionType, VendorQuote } from '../types/planner';

/**
 * Returns pre-loaded realistic vendor quotes tailored to the selected occasion type.
 *
 * @param occasion - The event occasion type.
 * @returns Array of 3 pre-loaded vendor quotes for comparison.
 */
export function getPresetVendorQuotes(occasion: OccasionType): VendorQuote[] {
  const presets: Record<OccasionType, VendorQuote[]> = {
    wedding: [
      buildQuote('vq-w1', 'Regal Banquets Delhi', 'Venue & Logistics', 280000, 250, ['AC Hall 8hrs', 'Valet Parking', 'Stage Setup'], ['Generator charges ₹8,000 extra', 'Overtime ₹15,000/hr after 11 PM']),
      buildQuote('vq-w2', 'Spice Route Caterers', 'Catering & Hospitality', 320000, 200, ['Welcome Drinks', '4-Course Buffet', 'Live Chaat Counter'], ['Corkage fee ₹5,000 for outside beverages', 'Extra ₹200/plate beyond 200 guests']),
      buildQuote('vq-w3', 'LensCraft Studios', 'Photography & Media', 95000, 999, ['Pre-wedding Shoot', 'Candid + Traditional', '3-min Highlight Reel'], ['Drone charges ₹12,000 extra', 'Album printing not included']),
    ],
    birthday: [
      buildQuote('vq-b1', 'FunZone Party Hall', 'Venue & Logistics', 45000, 100, ['AC Banquet 5hrs', 'Sound System', 'Parking'], ['Decoration not included', 'Extension ₹5,000/hr']),
      buildQuote('vq-b2', 'TastyBites Catering', 'Catering & Hospitality', 60000, 80, ['Snacks + Main Course', 'Birthday Cake 3kg', 'Mocktails'], ['Non-veg upcharge ₹150/plate', 'Crockery deposit ₹3,000']),
      buildQuote('vq-b3', 'SnapHappy Photos', 'Photography & Media', 25000, 999, ['3hr Coverage', '100 Edited Photos', 'USB Drive'], ['Extra hour ₹5,000', 'Video not included']),
    ],
    community: [
      buildQuote('vq-c1', 'CityGround Open Venue', 'Venue & Logistics', 150000, 500, ['Open Ground 12hrs', 'Tent + Chairs 400', 'Electricity Points'], ['Rain shelter ₹25,000 extra', 'Security deposit ₹15,000']),
      buildQuote('vq-c2', 'MegaBite Caterers', 'Catering & Hospitality', 200000, 350, ['Buffet for 350', 'Tea/Coffee Stall', 'Paper Plates'], ['Additional 50 guests = ₹30,000', 'Ice cream counter separate']),
      buildQuote('vq-c3', 'StageLights Entertainment', 'Entertainment & Rituals', 80000, 999, ['DJ + Sound 6hrs', 'LED Stage', 'Emcee'], ['Fog machine ₹3,000 extra', 'Copyright music license not included']),
    ],
  };
  return presets[occasion] ?? presets.wedding;
}

/**
 * Compares a vendor quote against the event context and category budget.
 *
 * @param quote - The vendor quote to evaluate.
 * @param context - Active event context for budget and guest comparisons.
 * @param categoryBudget - The allocated budget for this quote's category.
 * @returns Comparison result with flags for capacity shortfall and budget overrun.
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

/**
 * Analyzes raw vendor quote text to extract structured price and risk information.
 *
 * @param rawText - Unstructured vendor quote text pasted by user.
 * @param category - The budget category this quote relates to.
 * @returns Partially structured VendorQuote extracted from raw text.
 */
export function analyzeRawQuoteText(rawText: string, category: BudgetCategoryName): VendorQuote {
  const priceMatch = rawText.match(/₹\s?([\d,]+)/);
  const extractedPrice = priceMatch ? parseInt((priceMatch[1] ?? '0').replace(/,/g, ''), 10) : 0;
  const guestMatch = rawText.match(/(\d+)\s*(?:guests?|pax|people|persons?)/i);
  const extractedCapacity = guestMatch ? parseInt(guestMatch[1] ?? '0', 10) : 0;
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

/** Result of comparing a vendor quote against event context. */
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

/** Helper to build a VendorQuote object with default clarification questions. */
function buildQuote(
  id: string, vendorName: string, category: BudgetCategoryName,
  quotedPrice: number, guestCapacity: number,
  inclusions: string[], hiddenRisks: string[]
): VendorQuote {
  return {
    id, vendorName, category, quotedPrice, guestCapacity,
    isVerifiedQuote: false, inclusions, hiddenRisks,
    clarificationQuestions: [
      'Is GST included in the quoted price?',
      'What is the cancellation/refund policy?',
      'Are there overtime or peak-season surcharges?',
    ],
  };
}
