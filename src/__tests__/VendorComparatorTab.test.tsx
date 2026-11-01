/**
 * @fileoverview Unit tests for VendorComparatorTab component.
 * Verifies quote cards, verification toggle, category selector, quote parsing with AI and fallback (10.3).
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VendorComparatorTab from '../components/VendorComparatorTab';
import { WEDDING_PRESET } from '../data/presets';
import { getPresetVendorQuotes } from '../domain/vendors/quotes';
import * as client from '../services/gemini/client';
import type * as ClientModule from '../services/gemini/client';
import { clearCache } from '../utils/cache';

vi.mock('../services/gemini/client', async (importOriginal) => {
  const actual = await importOriginal<typeof ClientModule>();
  return {
    ...actual,
    executeStructuredGeminiCall: vi.fn(),
  };
});

describe('VendorComparatorTab component (10.3)', () => {
  const quotes = getPresetVendorQuotes(WEDDING_PRESET.occasion);

  beforeEach(() => {
    clearCache();
    vi.clearAllMocks();
  });

  it('renders vendor quote cards and quote paste area', () => {
    render(
      <VendorComparatorTab
        quotes={quotes}
        context={WEDDING_PRESET}
        categoryBudgets={{ 'Catering & Hospitality': 280000 }}
        onToggleVerified={vi.fn()}
        onAddQuote={vi.fn()}
      />
    );

    expect(screen.getByText(/Vendor Quote Comparator/i)).toBeDefined();
    expect(screen.getByText(/Regal Banquets Delhi/i)).toBeDefined();
    expect(screen.getByLabelText(/Raw vendor quote text/i)).toBeDefined();
  });

  it('toggles verified status and ignores empty quote submit', () => {
    const onToggleVerified = vi.fn();
    const onAddQuote = vi.fn();

    render(
      <VendorComparatorTab
        quotes={quotes}
        context={WEDDING_PRESET}
        categoryBudgets={{ 'Catering & Hospitality': 280000 }}
        onToggleVerified={onToggleVerified}
        onAddQuote={onAddQuote}
      />
    );

    const toggleButtons = screen.getAllByRole('button', { name: /Toggle verification for/i });
    if (toggleButtons[0]) fireEvent.click(toggleButtons[0]);
    expect(onToggleVerified).toHaveBeenCalledTimes(1);

    const parseBtn = screen.getByRole('button', { name: /Analyze pasted quote/i });
    fireEvent.click(parseBtn);
    expect(onAddQuote).not.toHaveBeenCalled();
  });

  it('parses quote with Gemini and attaches provenance and normalizes per-plate', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: true,
      data: {
        vendorName: 'Royal Feast Caterers',
        category: 'Catering & Hospitality',
        quotedPrice: 1200,
        guestCapacity: 150,
        inclusions: ['Full dinner spread'],
        hiddenRisks: [],
        negotiationPoints: ['Ask for tasting session'],
      },
      model: 'gemini-3.8-flash',
    });

    const onAddQuote = vi.fn();
    render(
      <VendorComparatorTab
        quotes={quotes}
        context={WEDDING_PRESET}
        categoryBudgets={{ 'Catering & Hospitality': 280000 }}
        onToggleVerified={vi.fn()}
        onAddQuote={onAddQuote}
      />
    );

    const textarea = screen.getByLabelText(/Raw vendor quote text/i);
    fireEvent.change(textarea, { target: { value: '₹1,200 per plate for 150 guests' } });

    const parseBtn = screen.getByRole('button', { name: /Analyze pasted quote/i });
    fireEvent.click(parseBtn);

    await waitFor(() => {
      expect(onAddQuote).toHaveBeenCalledTimes(1);
    });

    const added = onAddQuote.mock.calls[0]?.[0];
    expect(added?.vendorName).toBe('Royal Feast Caterers');
    expect(added?.quotedPrice).toBe(180000);
    expect(added?.perUnitPrice).toBe(1200);
    expect(added?.provenance?.source).toBe('gemini');
    expect(added?.provenance?.model).toBe('gemini-3.8-flash');
  });

  it('falls back to deterministic analysis when Gemini fails and flags 0 price', async () => {
    vi.mocked(client.executeStructuredGeminiCall).mockResolvedValueOnce({
      success: false,
      reason: 'quota-exceeded',
    });

    const onAddQuote = vi.fn();
    render(
      <VendorComparatorTab
        quotes={quotes}
        context={WEDDING_PRESET}
        categoryBudgets={{ 'Catering & Hospitality': 280000 }}
        onToggleVerified={vi.fn()}
        onAddQuote={onAddQuote}
      />
    );

    const textarea = screen.getByLabelText(/Raw vendor quote text/i);
    fireEvent.change(textarea, { target: { value: 'Call us for pricing' } });

    const parseBtn = screen.getByRole('button', { name: /Analyze pasted quote/i });
    fireEvent.click(parseBtn);

    await waitFor(() => {
      expect(onAddQuote).toHaveBeenCalledTimes(1);
    });

    const added = onAddQuote.mock.calls[0]?.[0];
    expect(added?.quotedPrice).toBe(0);
    expect(added?.hiddenRisks).toContain('No price disclosed in quote text — flagged for missing pricing');
    expect(added?.provenance?.source).toBe('deterministic');
    expect(added?.provenance?.reason).toBe('quota-exceeded');
  });
});
