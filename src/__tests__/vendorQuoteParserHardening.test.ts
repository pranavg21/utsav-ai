/**
 * @fileoverview Tests for Indian vendor quote pasted parser hardening (9.8).
 * Tests acceptance of Rs, Rs., INR, Lakh/L, and per-plate normalizations.
 */

import { describe, it, expect } from 'vitest';
import { analyzeRawQuoteText, normalizeExtractedQuote } from '../domain/vendors/normalize';

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
    expect(typeof quote.allInCost).toBe('number');
    expect(quote.allInCost).toBeGreaterThan(quote.quotedPrice);
  });

  it('normalizeExtractedQuote covers per-unit packaging and default fallbacks', () => {
    const prov = { source: 'gemini' as const, model: 'gemini-3.8-flash' };

    const quote1 = normalizeExtractedQuote(
      {
        vendorName: '',
        category: 'NonExistentCategory',
        quotedPrice: 50000,
        guestCapacity: 100,
        inclusions: [],
        hiddenRisks: [],
        negotiationPoints: [],
      },
      {
        rawText: '₹50,000 package per plate plus extra surcharge',
        category: 'Catering & Hospitality',
        defaultGuests: 100,
        provenance: prov,
      }
    );
    expect(quote1.vendorName).toBe('Custom Vendor (AI Parsed)');
    expect(quote1.category).toBe('Catering & Hospitality');
    expect(quote1.perUnitPrice).toBe(500);
    expect(quote1.hiddenRisks).toContain('Potential extra charges detected in quote text');
    expect(quote1.clarificationQuestions[0]).toContain('Confirm final all-inclusive price with GST');

    const quote2 = normalizeExtractedQuote(
      {
        vendorName: 'Zero Vendor',
        category: 'Venue & Logistics',
        quotedPrice: 0,
        guestCapacity: 0,
        inclusions: ['Hall access'],
        hiddenRisks: [],
        negotiationPoints: [],
      },
      {
        rawText: 'Call us for pricing',
        category: 'Venue & Logistics',
        defaultGuests: 150,
        provenance: prov,
      }
    );
    expect(quote2.quotedPrice).toBe(0);
    expect(quote2.guestCapacity).toBe(150);
    expect(quote2.hiddenRisks).toContain('No price disclosed in quote text — flagged for missing pricing');
    expect(quote2.clarificationQuestions[0]).toContain('Request formal baseline price card or quote');
  });
});
