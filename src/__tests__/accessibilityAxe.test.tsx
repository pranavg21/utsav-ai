/**
 * @fileoverview Automated WCAG 2.1 AA accessibility audit tests via vitest-axe.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import Header from '../components/Header';
import BudgetMatrixTab from '../components/BudgetMatrixTab';
import VendorComparatorTab from '../components/VendorComparatorTab';
import { WEDDING_PRESET } from '../data/presets';
import {
  buildInitialBudgetItems,
  evaluateBudgetAndTradeoffs,
} from '../services/budgetTradeoffEngine';
import { getPresetVendorQuotes } from '../services/vendorQuoteComparator';

describe('WCAG 2.1 AA Accessibility Audits (vitest-axe)', () => {
  it('Header component has 0 accessibility violations', async () => {
    const { container } = render(
      <Header
        onSelectPreset={vi.fn()}
        onToggleContrast={vi.fn()}
        onToggleLargeText={vi.fn()}
        isHighContrast={false}
        isLargeText={false}
      />
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('BudgetMatrixTab has 0 accessibility violations', async () => {
    const items = buildInitialBudgetItems(WEDDING_PRESET);
    const evaluation = evaluateBudgetAndTradeoffs(WEDDING_PRESET, items);
    const { container } = render(
      <BudgetMatrixTab
        evaluation={evaluation}
        onToggleVerified={vi.fn()}
        onUpdateAmount={vi.fn()}
        onApplyTradeOff={vi.fn()}
      />
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('VendorComparatorTab has 0 accessibility violations', async () => {
    const quotes = getPresetVendorQuotes(WEDDING_PRESET.occasion);
    const { container } = render(
      <VendorComparatorTab
        quotes={quotes}
        context={WEDDING_PRESET}
        categoryBudgets={{ 'Catering & Hospitality': 280000 }}
        onToggleVerified={vi.fn()}
        onAddQuote={vi.fn()}
      />
    );
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
