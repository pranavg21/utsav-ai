/**
 * @fileoverview Default vendor quote presets for Indian celebration types.
 */

import type { BudgetCategoryName, OccasionType, VendorQuote } from '../../types/planner';

interface QuoteOptions {
  readonly id: string;
  readonly vendorName: string;
  readonly category: BudgetCategoryName;
  readonly quotedPrice: number;
  readonly guestCapacity: number;
  readonly inclusions: readonly string[];
  readonly hiddenRisks: readonly string[];
}

function makeQuote(opts: QuoteOptions): VendorQuote {
  return {
    id: opts.id,
    vendorName: opts.vendorName,
    category: opts.category,
    quotedPrice: opts.quotedPrice,
    guestCapacity: opts.guestCapacity,
    isVerifiedQuote: false,
    inclusions: [...opts.inclusions],
    hiddenRisks: [...opts.hiddenRisks],
    clarificationQuestions: [
      'Is GST included in the quoted price?',
      'What is the cancellation/refund policy?',
      'Are there overtime or peak-season surcharges?',
    ],
  };
}

export function getPresetVendorQuotes(occasion: OccasionType): VendorQuote[] {
  const presets: Record<OccasionType, VendorQuote[]> = {
    wedding: [
      makeQuote({
        id: 'vq-w1',
        vendorName: 'Regal Banquets Delhi',
        category: 'Venue & Logistics',
        quotedPrice: 280000,
        guestCapacity: 250,
        inclusions: ['AC Hall 8hrs', 'Valet Parking', 'Stage Setup'],
        hiddenRisks: ['Generator charges ₹8,000 extra', 'Overtime ₹15,000/hr after 11 PM'],
      }),
      makeQuote({
        id: 'vq-w2',
        vendorName: 'Spice Route Caterers',
        category: 'Catering & Hospitality',
        quotedPrice: 320000,
        guestCapacity: 200,
        inclusions: ['Welcome Drinks', '4-Course Buffet', 'Live Chaat Counter'],
        hiddenRisks: ['Corkage fee ₹5,000 for outside beverages', 'Extra ₹200/plate beyond 200 guests'],
      }),
      makeQuote({
        id: 'vq-w3',
        vendorName: 'LensCraft Studios',
        category: 'Photography & Media',
        quotedPrice: 95000,
        guestCapacity: 999,
        inclusions: ['Pre-wedding Shoot', 'Candid + Traditional', '3-min Highlight Reel'],
        hiddenRisks: ['Drone charges ₹12,000 extra', 'Album printing not included'],
      }),
    ],
    birthday: [
      makeQuote({
        id: 'vq-b1',
        vendorName: 'FunZone Party Hall',
        category: 'Venue & Logistics',
        quotedPrice: 45000,
        guestCapacity: 100,
        inclusions: ['AC Banquet 5hrs', 'Sound System', 'Parking'],
        hiddenRisks: ['Decoration not included', 'Extension ₹5,000/hr'],
      }),
      makeQuote({
        id: 'vq-b2',
        vendorName: 'TastyBites Catering',
        category: 'Catering & Hospitality',
        quotedPrice: 60000,
        guestCapacity: 80,
        inclusions: ['Snacks + Main Course', 'Birthday Cake 3kg', 'Mocktails'],
        hiddenRisks: ['Non-veg upcharge ₹150/plate', 'Crockery deposit ₹3,000'],
      }),
      makeQuote({
        id: 'vq-b3',
        vendorName: 'SnapHappy Photos',
        category: 'Photography & Media',
        quotedPrice: 25000,
        guestCapacity: 999,
        inclusions: ['3hr Coverage', '100 Edited Photos', 'USB Drive'],
        hiddenRisks: ['Extra hour ₹5,000', 'Video not included'],
      }),
    ],
    community: [
      makeQuote({
        id: 'vq-c1',
        vendorName: 'CityGround Open Venue',
        category: 'Venue & Logistics',
        quotedPrice: 150000,
        guestCapacity: 500,
        inclusions: ['Open Ground 12hrs', 'Tent + Chairs 400', 'Electricity Points'],
        hiddenRisks: ['Rain shelter ₹25,000 extra', 'Security deposit ₹15,000'],
      }),
      makeQuote({
        id: 'vq-c2',
        vendorName: 'MegaBite Caterers',
        category: 'Catering & Hospitality',
        quotedPrice: 200000,
        guestCapacity: 350,
        inclusions: ['Buffet for 350', 'Tea/Coffee Stall', 'Paper Plates'],
        hiddenRisks: ['Additional 50 guests = ₹30,000', 'Ice cream counter separate'],
      }),
      makeQuote({
        id: 'vq-c3',
        vendorName: 'StageLights Entertainment',
        category: 'Entertainment & Rituals',
        quotedPrice: 80000,
        guestCapacity: 999,
        inclusions: ['DJ + Sound 6hrs', 'LED Stage', 'Emcee'],
        hiddenRisks: ['Fog machine ₹3,000 extra', 'Copyright music license not included'],
      }),
    ],
  };

  return presets[occasion] ?? presets.wedding;
}
