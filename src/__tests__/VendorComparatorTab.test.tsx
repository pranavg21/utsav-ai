/**
 * @fileoverview Unit tests for VendorComparatorTab component.
 * Verifies quote cards, verification toggle, category selector, and quote parsing.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VendorComparatorTab from '../components/VendorComparatorTab';
import { WEDDING_PRESET } from '../data/presets';
import { getPresetVendorQuotes } from '../domain/vendors/quotes';

describe('VendorComparatorTab component', () => {
  const quotes = getPresetVendorQuotes(WEDDING_PRESET.occasion);

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

  it('toggles verified status and handles empty quote submit', () => {
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
    if (toggleButtons[0]) {
      fireEvent.click(toggleButtons[0]);
    }
    expect(onToggleVerified).toHaveBeenCalledTimes(1);

    // Click parse when textarea is empty
    const parseBtn = screen.getByRole('button', { name: /Analyze pasted quote/i });
    fireEvent.click(parseBtn);
    expect(onAddQuote).not.toHaveBeenCalled();
  });

  it('changes category dropdown and parses pasted raw quote', () => {
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

    const catSelect = screen.getByLabelText('Quote category');
    fireEvent.change(catSelect, { target: { value: 'Decor & Ambience' } });

    const textarea = screen.getByLabelText(/Raw vendor quote text/i);
    fireEvent.change(textarea, {
      target: { value: 'Grand Palace quote: ₹350,000 for 300 guests including decor' },
    });

    const parseBtn = screen.getByRole('button', { name: /Analyze pasted quote/i });
    fireEvent.click(parseBtn);
    expect(onAddQuote).toHaveBeenCalledTimes(1);
  });
});
