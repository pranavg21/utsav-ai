/**
 * @fileoverview Unit tests for all-in vendor cost calculation with GST and buffers.
 */

import { describe, it, expect } from 'vitest';
import { calculateAllInCost } from '../domain/vendors/normalize';
import type { VendorQuote } from '../types/planner';

describe('calculateAllInCost', () => {
  it('calculates all-in cost for per-plate catering quotes (< ₹5,000)', () => {
    const perPlateQuote: VendorQuote = {
      id: 'q-plate-1',
      vendorName: 'Annapurna Caterers',
      category: 'Catering & Hospitality',
      quotedPrice: 1200, // ₹1,200/plate
      guestCapacity: 200,
      isVerifiedQuote: false,
      inclusions: ['Full buffet'],
      hiddenRisks: [],
      clarificationQuestions: [],
    };

    const breakdown = calculateAllInCost(perPlateQuote, 100, {
      headcountBuffer: 0.1, // 10% buffer -> 110 guests
      gstRate: 0.05, // 5% GST
    });

    // baseAmount = 1200 * 110 = 132000
    // gstAmount = 132000 * 0.05 = 6600
    // allInCost = 138600
    expect(breakdown.baseAmount).toBe(132000);
    expect(breakdown.gstAmount).toBe(6600);
    expect(breakdown.allInCost).toBe(138600);
  });

  it('calculates all-in cost for fixed package quotes (>= ₹5,000)', () => {
    const packageQuote: VendorQuote = {
      id: 'q-venue-1',
      vendorName: 'Royal Palace Banquet',
      category: 'Venue & Logistics',
      quotedPrice: 200000,
      guestCapacity: 300,
      isVerifiedQuote: true,
      inclusions: ['AC banquet'],
      hiddenRisks: [],
      clarificationQuestions: [],
    };

    const breakdown = calculateAllInCost(packageQuote, 200, {
      gstRate: 0.18, // 18% GST
    });

    expect(breakdown.baseAmount).toBe(200000);
    expect(breakdown.gstAmount).toBe(36000);
    expect(breakdown.allInCost).toBe(236000);
  });
});
