/**
 * @fileoverview Tests for Indian vendor quote pasted parser hardening (9.8).
 * Tests acceptance of Rs, Rs., INR, Lakh/L, and per-plate normalizations.
 */

import { describe, it, expect } from 'vitest';
import { analyzeRawQuoteText } from '../domain/vendors/normalize';

describe('Vendor Pasted Quote Parser Hardening (9.8)', () => {
  it('repro 1: parses "Rs. 3,20,000 for 200 pax incl GST" -> quotedPrice: 320000', () => {
    const text = 'Rs. 3,20,000 for 200 pax incl GST';
    const quote = analyzeRawQuoteText(text, 'Venue & Logistics', 200);
    expect(quote.quotedPrice).toBe(320000);
    expect(quote.guestCapacity).toBe(200);
  });

  it('repro 2: parses "₹1,200 per plate for 200 guests" -> perUnitPrice: 1200, quotedPrice: 240000', () => {
    const text = '₹1,200 per plate for 200 guests';
    const quote = analyzeRawQuoteText(text, 'Catering & Hospitality', 200);
    expect(quote.perUnitPrice).toBe(1200);
    expect(quote.quotedPrice).toBe(240000);
  });

  it('repro 3: parses "2.5L package" -> quotedPrice: 250000', () => {
    const text = '2.5L package';
    const quote = analyzeRawQuoteText(text, 'Decor & Ambience', 100);
    expect(quote.quotedPrice).toBe(250000);
  });

  it('calculates allInCost and attaches to quote', () => {
    const text = '₹1,000 per plate for 100 guests';
    const quote = analyzeRawQuoteText(text, 'Catering & Hospitality', 100);
    expect(quote.allInCost).toBeDefined();
    expect(quote.allInCost).toBeGreaterThan(quote.quotedPrice);
  });
});
