/**
 * @fileoverview Unit tests for VendorComparatorTab component.
 * Verifies vendor quote card rendering, quote verification toggle, and raw quote paste parsing.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VendorComparatorTab from '../components/VendorComparatorTab';
import { WEDDING_PRESET } from '../data/presets';
import { getPresetVendorQuotes } from '../services/vendorQuoteComparator';

describe('VendorComparatorTab component', () => {
  const quotes = getPresetVendorQuotes(WEDDING_PRESET.occasion);

  it('should render vendor quote cards and quote paste area', () => {
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

  it('should toggle verified status when toggle button is clicked', () => {
    const onToggleVerified = vi.fn();
    render(
      <VendorComparatorTab
        quotes={quotes}
        context={WEDDING_PRESET}
        categoryBudgets={{ 'Catering & Hospitality': 280000 }}
        onToggleVerified={onToggleVerified}
        onAddQuote={vi.fn()}
      />
    );

    const toggleButtons = screen.getAllByRole('button', { name: /Toggle verification for/i });
    expect(toggleButtons.length).toBeGreaterThan(0);
    fireEvent.click(toggleButtons[0]!);
    expect(onToggleVerified).toHaveBeenCalledTimes(1);
  });

  it('should parse pasted raw quote and trigger onAddQuote', () => {
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
    fireEvent.change(textarea, { target: { value: 'Grand Palace quote: ₹350,000 for 300 guests including decor' } });

    const parseBtn = screen.getByRole('button', { name: /Analyze pasted quote/i });
    fireEvent.click(parseBtn);
    expect(onAddQuote).toHaveBeenCalledTimes(1);
  });
});
