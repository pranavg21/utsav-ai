/**
 * @fileoverview Unit tests for Gemini vendor AI capabilities: checklist generation and quote extraction.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as client from '../services/gemini/client';
import type * as ClientModule from '../services/gemini/client';
import {
  generateVendorChecklistWithAi,
  extractVendorQuoteWithAi,
} from '../services/gemini/vendorAi';
import { WEDDING_PRESET } from '../data/presets';
import { clearCache } from '../utils/cache';

vi.mock('../services/gemini/client', async (importOriginal) => {
  const actual = await importOriginal<typeof ClientModule>();
  return {
    ...actual,
    executeStructuredGeminiCall: vi.fn(),
  };
});

describe('Gemini Vendor AI (Checklist & Quote Extraction)', () => {
  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });

  it('generates vendor checklist via Gemini structured call when successful', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: true,
      data: {
        items: [
          {
            vendorType: 'Custom Caterer',
            category: 'Catering & Hospitality',
            dueDaysBeforeEvent: 45,
            mustAsk: ['Tasting date?'],
            documents: ['FSSAI license'],
          },
        ],
      },
      model: 'gemini-2.5-flash',
    });

    const result = await generateVendorChecklistWithAi(WEDDING_PRESET);
    expect(result.provenance.source).toBe('gemini');
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.vendorType).toBe('Custom Caterer');
  });

  it('falls back to deterministic templates on API failure', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: false,
      reason: 'quota-exceeded',
    });

    const result = await generateVendorChecklistWithAi(WEDDING_PRESET);
    expect(result.provenance.source).toBe('deterministic');
    expect(result.provenance.reason).toBe('quota-exceeded');
    expect(result.data.length).toBeGreaterThan(5);
  });

  it('extracts vendor quote via Gemini structured call when successful', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: true,
      data: {
        vendorName: 'Royal Banquet',
        category: 'Venue & Logistics',
        quotedPrice: 350000,
        guestCapacity: 250,
        inclusions: ['Hall AC', 'Chairs'],
        hiddenRisks: ['Generator diesel extra'],
        negotiationPoints: ['Ask for complimentary green room'],
      },
      model: 'gemini-2.5-flash',
    });

    const result = await extractVendorQuoteWithAi('Banquet text ₹3,50,000', 'Venue & Logistics');
    expect(result.provenance.source).toBe('gemini');
    expect(result.data.vendorName).toBe('Royal Banquet');
    expect(result.data.quotedPrice).toBe(350000);
  });

  it('falls back to deterministic quote extraction envelope on failure', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: false,
      reason: 'no-api-key',
    });

    const result = await extractVendorQuoteWithAi('Raw text', 'Venue & Logistics');
    expect(result.provenance.source).toBe('deterministic');
    expect(result.provenance.reason).toBe('no-api-key');
    expect(result.data.vendorName).toBe('Local Vendor Quote');
  });
});

