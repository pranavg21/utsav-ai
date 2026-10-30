/**
 * @fileoverview Unit tests for BudgetMatrixTab component.
 * Verifies category allocations, amount inputs, verified badges, and tradeoff scenario application.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetMatrixTab from '../components/BudgetMatrixTab';
import { WEDDING_PRESET } from '../data/presets';
import { buildInitialBudgetItems } from '../domain/budget/allocation';
import { evaluateBudgetAndTradeoffs } from '../domain/budget/tradeoffs';

describe('BudgetMatrixTab component', () => {
  const budgetItems = buildInitialBudgetItems(WEDDING_PRESET);
  const evaluation = evaluateBudgetAndTradeoffs(WEDDING_PRESET, budgetItems);

  it('renders budget matrix, edits projected amount, and toggles verified', () => {
    const onUpdateAmount = vi.fn();
    const onToggleVerified = vi.fn();

    render(
      <BudgetMatrixTab
        evaluation={evaluation}
        onToggleVerified={onToggleVerified}
        onUpdateAmount={onUpdateAmount}
        onApplyTradeOff={vi.fn()}
      />
    );

    expect(screen.getByRole('region', { name: /Budget matrix/i })).toBeDefined();
    expect(screen.getByText('Venue & Logistics')).toBeDefined();

    const input = screen.getByLabelText('Projected amount for Venue & Logistics');
    fireEvent.change(input, { target: { value: '250000' } });
    expect(onUpdateAmount).toHaveBeenCalledWith(budgetItems[0]?.id, 250000);

    const toggleButtons = screen.getAllByRole('button', { name: /Toggle verification for/i });
    if (toggleButtons[0]) {
      fireEvent.click(toggleButtons[0]);
    }
    expect(onToggleVerified).toHaveBeenCalledTimes(1);
  });

  it('renders verified badge and overrun banner with trade-off triggers', () => {
    const onApplyTradeOff = vi.fn();
    const overrunItems = budgetItems.map((i, idx) => ({
      ...i,
      isVerifiedQuote: idx === 0,
      projectedAmount: i.projectedAmount * 1.3,
    }));
    const overrunEval = evaluateBudgetAndTradeoffs(WEDDING_PRESET, overrunItems);

    render(
      <BudgetMatrixTab
        evaluation={overrunEval}
        onToggleVerified={vi.fn()}
        onUpdateAmount={vi.fn()}
        onApplyTradeOff={onApplyTradeOff}
      />
    );

    expect(screen.getByText('Verified Quote')).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();

    const applyButtons = screen.getAllByRole('button', { name: /Apply trade-off:/i });
    if (applyButtons[0]) {
      fireEvent.click(applyButtons[0]);
    }
    expect(onApplyTradeOff).toHaveBeenCalledTimes(1);
  });
});
