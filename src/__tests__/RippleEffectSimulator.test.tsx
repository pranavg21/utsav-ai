/**
 * @fileoverview Unit tests for RippleEffectSimulator component.
 * Verifies simulation input rendering, shock scenario buttons, and custom prompt submissions.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RippleEffectSimulator from '../components/RippleEffectSimulator';
import { WEDDING_PRESET } from '../data/presets';

describe('RippleEffectSimulator component', () => {
  it('should render simulation prompt input and shock scenario buttons', () => {
    const onApply = vi.fn();
    render(<RippleEffectSimulator context={WEDDING_PRESET} onApplyChange={onApply} />);

    expect(screen.getByLabelText(/Custom change request input/i)).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Apply shock: \+20% Expense Overrun/i })
    ).toBeDefined();
    expect(screen.getByRole('button', { name: /Apply shock: \+50 Guests/i })).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Apply shock: Venue Booking Delayed/i })
    ).toBeDefined();
  });

  it('should trigger onApplyChange when shock scenario buttons are clicked', () => {
    const onApply = vi.fn();
    render(<RippleEffectSimulator context={WEDDING_PRESET} onApplyChange={onApply} />);

    const overrunBtn = screen.getByRole('button', { name: /Apply shock: \+20% Expense Overrun/i });
    fireEvent.click(overrunBtn);
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('should trigger onApplyChange when submitting custom change request', () => {
    const onApply = vi.fn();
    render(<RippleEffectSimulator context={WEDDING_PRESET} onApplyChange={onApply} />);

    const input = screen.getByLabelText(/Custom change request input/i);
    fireEvent.change(input, { target: { value: 'Add 30 guests and increase budget' } });

    const submitBtn = screen.getByRole('button', { name: /Apply custom change/i });
    fireEvent.click(submitBtn);
    expect(onApply).toHaveBeenCalledTimes(1);
  });
});
