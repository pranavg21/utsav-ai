/**
 * @fileoverview Accessibility and interaction tests for SubEventsTab.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'vitest-axe';
import SubEventsTab from '../components/subEvents/SubEventsTab';
import { WEDDING_SUB_EVENTS } from '../domain/subEvents/types';
import { WEDDING_PRESET } from '../data/presets';
import { buildInitialBudgetItems } from '../domain/budget/allocation';

describe('SubEventsTab Accessibility & Interaction', () => {
  it('has zero accessibility violations on axe audit', async () => {
    const items = buildInitialBudgetItems(WEDDING_PRESET);
    const { container } = render(
      <SubEventsTab
        subEvents={WEDDING_SUB_EVENTS}
        totalBudget={WEDDING_PRESET.totalBudget}
        totalGuests={WEDDING_PRESET.guestCount}
        items={items}
        onUpdateSubEvent={vi.fn()}
      />
    );

    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('renders function x category matrix and allows editing guest count and share %', () => {
    const items = buildInitialBudgetItems(WEDDING_PRESET);
    const mockUpdate = vi.fn();
    render(
      <SubEventsTab
        subEvents={WEDDING_SUB_EVENTS}
        totalBudget={WEDDING_PRESET.totalBudget}
        totalGuests={WEDDING_PRESET.guestCount}
        items={items}
        onUpdateSubEvent={mockUpdate}
      />
    );

    expect(screen.getByText('Multi-Function Event Coordination')).toBeDefined();
    expect(screen.getByText('Function × Category Budget Matrix')).toBeDefined();

    const haldiGuestsInput = screen.getByLabelText('Haldi Ceremony guest count');
    fireEvent.change(haldiGuestsInput, { target: { value: '75' } });
    expect(mockUpdate).toHaveBeenCalledWith('se-haldi', { guestCount: 75 });

    const haldiShareInput = screen.getByLabelText('Haldi Ceremony budget share percentage');
    fireEvent.change(haldiShareInput, { target: { value: '12' } });
    expect(mockUpdate).toHaveBeenCalledWith('se-haldi', { budgetSharePercent: 12 });
  });

  it('renders alerts when capacity conflict occurs', () => {
    const items = buildInitialBudgetItems(WEDDING_PRESET);
    const conflictingSubEvents = [
      {
        id: 'se-huge',
        name: 'Huge Reception',
        dayOffset: 0,
        guestCount: 500, // exceeds base 200
        venueType: 'banquet' as const,
        budgetSharePercent: 100,
      },
    ];

    render(
      <SubEventsTab
        subEvents={conflictingSubEvents}
        totalBudget={1000000}
        totalGuests={200}
        items={items}
        onUpdateSubEvent={vi.fn()}
      />
    );

    expect(screen.getByText(/exceeds overall wedding guest capacity/i)).toBeDefined();
    expect(screen.getByText(/Reduce sub-event guest count/i)).toBeDefined();
  });
});
