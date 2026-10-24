/**
 * @fileoverview Unit tests for the Vendor Quote Comparator service.
 * Tests guest capacity shortfall detection, budget overrun flagging, and raw quote text analysis.
 */

import { describe, it, expect } from 'vitest';
import {
  getPresetVendorQuotes,
  compareQuoteToContext,
  analyzeRawQuoteText,
} from '../services/vendorQuoteComparator';
import type { EventContext, VendorQuote } from '../types/planner';

/** Test context for vendor comparison. */
const TEST_CONTEXT: EventContext = {
  occasion: 'wedding',
  eventName: 'Test Wedding',
  totalBudget: 800000,
  guestCount: 200,
  daysUntilEvent: 120,
  experienceTier: 'grand',
  priorityRanking: [
    'Catering & Hospitality', 'Venue & Logistics', 'Photography & Media',
    'Decor & Ambience', 'Entertainment & Rituals', 'Contingency Reserve',
  ],
  ageGroups: ['adults'],
  accessibilityNeeds: [],
  mustHaves: [],
};

describe('getPresetVendorQuotes', () => {
  it('should return 3 quotes for wedding occasion', () => {
    const quotes = getPresetVendorQuotes('wedding');
    expect(quotes).toHaveLength(3);
  });

  it('should return 3 quotes for birthday occasion', () => {
    const quotes = getPresetVendorQuotes('birthday');
    expect(quotes).toHaveLength(3);
  });

  it('should return 3 quotes for community occasion', () => {
    const quotes = getPresetVendorQuotes('community');
    expect(quotes).toHaveLength(3);
  });

  it('should mark all preset quotes as unverified by default', () => {
    const quotes = getPresetVendorQuotes('wedding');
    for (const q of quotes) {
      expect(q.isVerifiedQuote).toBe(false);
    }
  });
});

describe('compareQuoteToContext', () => {
  it('should detect guest capacity shortfall', () => {
    const quote: VendorQuote = {
      id: 'test-q1', vendorName: 'Test Vendor', category: 'Catering & Hospitality',
      quotedPrice: 200000, guestCapacity: 150, isVerifiedQuote: false,
      inclusions: [], hiddenRisks: [], clarificationQuestions: [],
    };
    const result = compareQuoteToContext(quote, TEST_CONTEXT, 300000);
    expect(result.isCapacityShortfall).toBe(true);
    expect(result.capacityGap).toBe(50);
  });

  it('should detect budget overrun when quote exceeds category budget', () => {
    const quote: VendorQuote = {
      id: 'test-q2', vendorName: 'Expensive Vendor', category: 'Venue & Logistics',
      quotedPrice: 350000, guestCapacity: 300, isVerifiedQuote: false,
      inclusions: [], hiddenRisks: [], clarificationQuestions: [],
    };
    const result = compareQuoteToContext(quote, TEST_CONTEXT, 250000);
    expect(result.isBudgetOverrun).toBe(true);
    expect(result.budgetDelta).toBe(100000);
  });

  it('should report no shortfall when capacity exceeds guest count', () => {
    const quote: VendorQuote = {
      id: 'test-q3', vendorName: 'Big Venue', category: 'Venue & Logistics',
      quotedPrice: 200000, guestCapacity: 500, isVerifiedQuote: false,
      inclusions: [], hiddenRisks: [], clarificationQuestions: [],
    };
    const result = compareQuoteToContext(quote, TEST_CONTEXT, 250000);
    expect(result.isCapacityShortfall).toBe(false);
    expect(result.capacityGap).toBe(0);
    expect(result.isBudgetOverrun).toBe(false);
  });
});

describe('analyzeRawQuoteText', () => {
  it('should extract price from quote text with ₹ symbol', () => {
    const text = 'Grand Venue Package: ₹2,80,000 for up to 250 guests including AC hall.';
    const result = analyzeRawQuoteText(text, 'Venue & Logistics');
    expect(result.quotedPrice).toBe(280000);
  });

  it('should extract guest capacity from text', () => {
    const text = 'Catering for 180 guests including buffet and live counters.';
    const result = analyzeRawQuoteText(text, 'Catering & Hospitality');
    expect(result.guestCapacity).toBe(180);
  });

  it('should flag hidden charges in text', () => {
    const text = 'Base price ₹1,50,000. Generator charges extra. Overtime not included.';
    const result = analyzeRawQuoteText(text, 'Venue & Logistics');
    expect(result.hiddenRisks.length).toBeGreaterThan(0);
  });

  it('should mark custom quotes as unverified', () => {
    const result = analyzeRawQuoteText('Simple quote ₹50,000', 'Photography & Media');
    expect(result.isVerifiedQuote).toBe(false);
  });

  it('should generate clarification questions', () => {
    const result = analyzeRawQuoteText('₹1,00,000 for event', 'Decor & Ambience');
    expect(result.clarificationQuestions.length).toBeGreaterThanOrEqual(3);
  });
});
