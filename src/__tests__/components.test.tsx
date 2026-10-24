/**
 * @fileoverview Unit tests for React components verifying DOM rendering and interactions.
 * Tests Header (h1, a11y toggles), ContextIntakePanel (form fields, updates),
 * and RippleEffectSimulator (shocks, prompt input).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../components/Header';
import ContextIntakePanel from '../components/ContextIntakePanel';
import RippleEffectSimulator from '../components/RippleEffectSimulator';
import VendorComparatorTab from '../components/VendorComparatorTab';
import { WEDDING_PRESET } from '../data/presets';
import { getPresetVendorQuotes } from '../services/vendorQuoteComparator';

describe('Header component', () => {
  it('should render exactly one h1 tag with application title', () => {
    render(
      <Header
        onSelectPreset={vi.fn()}
        onToggleContrast={vi.fn()}
        onToggleLargeText={vi.fn()}
        isHighContrast={false}
        isLargeText={false}
      />
    );
    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements).toHaveLength(1);
    expect(h1Elements[0]?.textContent).toContain('UtsavAI');
  });

  it('should trigger onToggleContrast when high contrast toggle is clicked', () => {
    const onToggleContrast = vi.fn();
    render(
      <Header
        onSelectPreset={vi.fn()}
        onToggleContrast={onToggleContrast}
        onToggleLargeText={vi.fn()}
        isHighContrast={false}
        isLargeText={false}
      />
    );
    const contrastBtn = screen.getByRole('button', { name: /Toggle high contrast mode/i });
    fireEvent.click(contrastBtn);
    expect(onToggleContrast).toHaveBeenCalledTimes(1);
  });

  it('should trigger onSelectPreset when a preset button is clicked', () => {
    const onSelectPreset = vi.fn();
    render(
      <Header
        onSelectPreset={onSelectPreset}
        onToggleContrast={vi.fn()}
        onToggleLargeText={vi.fn()}
        isHighContrast={false}
        isLargeText={false}
      />
    );
    const presetBtn = screen.getByRole('button', { name: /Load preset: SME Benchmark/i });
    fireEvent.click(presetBtn);
    expect(onSelectPreset).toHaveBeenCalledWith(WEDDING_PRESET);
  });

  it('should display active engine status indicator', () => {
    render(
      <Header
        onSelectPreset={vi.fn()}
        onToggleContrast={vi.fn()}
        onToggleLargeText={vi.fn()}
        isHighContrast={false}
        isLargeText={false}
      />
    );
    expect(screen.getByText(/Smart Deterministic Engine Active/i)).toBeDefined();
  });
});

describe('ContextIntakePanel component', () => {
  it('should render occasion, budget, and guest count inputs', () => {
    const onUpdate = vi.fn();
    render(<ContextIntakePanel context={WEDDING_PRESET} onUpdate={onUpdate} />);

    expect(screen.getByLabelText(/Select occasion type/i)).toBeDefined();
    expect(screen.getByLabelText(/Total budget in rupees/i)).toBeDefined();
    expect(screen.getByLabelText(/Number of guests/i)).toBeDefined();
    expect(screen.getByLabelText(/Days until event/i)).toBeDefined();
  });

  it('should call onUpdate when total budget is changed', () => {
    const onUpdate = vi.fn();
    render(<ContextIntakePanel context={WEDDING_PRESET} onUpdate={onUpdate} />);

    const budgetInput = screen.getByLabelText(/Total budget in rupees/i);
    fireEvent.change(budgetInput, { target: { value: '900000' } });
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});

describe('RippleEffectSimulator component', () => {
  it('should render simulation prompt input and shock scenario buttons', () => {
    const onApply = vi.fn();
    render(<RippleEffectSimulator context={WEDDING_PRESET} onApplyChange={onApply} />);

    expect(screen.getByLabelText(/Custom change request input/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Apply shock: \+20% Expense Overrun/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Apply shock: \+50 Guests/i })).toBeDefined();
  });

  it('should trigger onApplyChange when a shock scenario button is clicked', () => {
    const onApply = vi.fn();
    render(<RippleEffectSimulator context={WEDDING_PRESET} onApplyChange={onApply} />);

    const shockBtn = screen.getByRole('button', { name: /Apply shock: \+50 Guests/i });
    fireEvent.click(shockBtn);
    expect(onApply).toHaveBeenCalledTimes(1);
  });
});

describe('VendorComparatorTab component', () => {
  it('should render vendor quote cards without hook errors', () => {
    const quotes = getPresetVendorQuotes(WEDDING_PRESET.occasion);
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
});
