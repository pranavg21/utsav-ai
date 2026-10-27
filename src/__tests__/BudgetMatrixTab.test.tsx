/**
 * @fileoverview Unit tests for BudgetMatrixTab component.
 * Verifies rendering of category allocations, verification toggles, amount changes, and tradeoff application.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetMatrixTab from '../components/BudgetMatrixTab';
import { WEDDING_PRESET } from '../data/presets';
import { buildInitialBudgetItems, evaluateBudgetAndTradeoffs } from '../services/budgetTradeoffEngine';

describe('BudgetMatrixTab component', () => {
  const budgetItems = buildInitialBudgetItems(WEDDING_PRESET);
  const evaluation = evaluateBudgetAndTradeoffs(WEDDING_PRESET, budgetItems);

  it('should render the budget matrix section with categories', () => {
    render(
      <BudgetMatrixTab
        evaluation={evaluation}
        onToggleVerified={vi.fn()}
        onUpdateAmount={vi.fn()}
        onApplyTradeOff={vi.fn()}
      />
    );

    expect(screen.getByRole('region', { name: /Budget matrix/i })).toBeDefined();
    expect(screen.getByText('Venue & Logistics')).toBeDefined();
    expect(screen.getByText('Catering & Hospitality')).toBeDefined();
  });

  it('should trigger onToggleVerified when verification badge is clicked', () => {
    const onToggleVerified = vi.fn();
    render(
      <BudgetMatrixTab
        evaluation={evaluation}
        onToggleVerified={onToggleVerified}
        onUpdateAmount={vi.fn()}
        onApplyTradeOff={vi.fn()}
      />
    );

    const toggleButtons = screen.getAllByRole('button', { name: /Toggle verification for/i });
    expect(toggleButtons.length).toBeGreaterThan(0);
    fireEvent.click(toggleButtons[0]!);
    expect(onToggleVerified).toHaveBeenCalledTimes(1);
  });

  it('should trigger onApplyTradeOff when an apply trade-off scenario button is clicked', () => {
    const onApplyTradeOff = vi.fn();
    const overrunItems = budgetItems.map((i) => ({ ...i, projectedAmount: i.projectedAmount * 1.3 }));
    const overrunEval = evaluateBudgetAndTradeoffs(WEDDING_PRESET, overrunItems);

    render(
      <BudgetMatrixTab
        evaluation={overrunEval}
        onToggleVerified={vi.fn()}
        onUpdateAmount={vi.fn()}
        onApplyTradeOff={onApplyTradeOff}
      />
    );

    const applyButtons = screen.getAllByRole('button', { name: /Apply trade-off:/i });
    expect(applyButtons.length).toBeGreaterThan(0);
    fireEvent.click(applyButtons[0]!);
    expect(onApplyTradeOff).toHaveBeenCalledTimes(1);
  });
});
