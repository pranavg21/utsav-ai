/**
 * @fileoverview Tests for NumericInputField formatted input and draft string persistence.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumericInputField } from '../components/intake/NumericInputField';

describe('NumericInputField', () => {
  it('allows typing formatted numbers with commas without stripping mid-stroke', () => {
    const onUpdate = vi.fn();
    render(
      <NumericInputField
        id="test-budget"
        label="Test Budget"
        value={50000}
        min={1000}
        max={10000000}
        ariaLabel="Budget input"
        onUpdate={onUpdate}
      />
    );

    const input = screen.getByLabelText('Budget input');
    if (!(input instanceof HTMLInputElement)) throw new Error('Not input');
    expect(input.value).toBe('50000');

    fireEvent.change(input, { target: { value: '1,00,000' } });
    expect(input.value).toBe('1,00,000');
    expect(onUpdate).toHaveBeenCalledWith(100000);

    fireEvent.blur(input);
    expect(onUpdate).toHaveBeenCalledWith(100000);
  });

  it('resets to current value when invalid text is entered on blur', () => {
    const onUpdate = vi.fn();
    render(
      <NumericInputField
        id="test-budget-2"
        label="Test Budget"
        value={80000}
        min={1000}
        max={10000000}
        ariaLabel="Budget input"
        onUpdate={onUpdate}
      />
    );

    const input = screen.getByLabelText('Budget input');
    if (!(input instanceof HTMLInputElement)) throw new Error('Not input');
    fireEvent.change(input, { target: { value: 'invalid-text' } });
    fireEvent.blur(input);
    expect(input.value).toBe('80000');
  });

  it('shows appropriate error message when value is below min or above max (10.7)', () => {
    const onUpdate = vi.fn();
    render(
      <NumericInputField
        id="test-budget-bounds"
        label="Budget"
        value={50000}
        min={1000}
        max={100000}
        ariaLabel="Bounded budget"
        onUpdate={onUpdate}
      />
    );

    const input = screen.getByLabelText('Bounded budget');

    // Below min
    fireEvent.change(input, { target: { value: '500' } });
    fireEvent.blur(input);
    expect(screen.getByRole('alert').textContent).toContain('Budget must be at least 1,000');

    // Above max
    fireEvent.change(input, { target: { value: '200000' } });
    fireEvent.blur(input);
    expect(screen.getByRole('alert').textContent).toContain('Budget must be at most 1,00,000');
  });
});
