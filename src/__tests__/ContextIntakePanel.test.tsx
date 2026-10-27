/**
 * @fileoverview Unit tests for ContextIntakePanel component.
 * Verifies form field rendering, occasion/tier selection, and budget numeric updates.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContextIntakePanel from '../components/ContextIntakePanel';
import { WEDDING_PRESET } from '../data/presets';

describe('ContextIntakePanel component', () => {
  it('should render occasion, budget, and guest count inputs', () => {
    const onUpdate = vi.fn();
    render(<ContextIntakePanel context={WEDDING_PRESET} onUpdate={onUpdate} />);

    expect(screen.getByLabelText(/Select occasion type/i)).toBeDefined();
    expect(screen.getByLabelText(/Total budget in rupees/i)).toBeDefined();
    expect(screen.getByLabelText(/Number of guests/i)).toBeDefined();
    expect(screen.getByLabelText(/Days until event/i)).toBeDefined();
  });

  it('should trigger onUpdate when total budget is changed', () => {
    const onUpdate = vi.fn();
    render(<ContextIntakePanel context={WEDDING_PRESET} onUpdate={onUpdate} />);

    const budgetInput = screen.getByLabelText(/Total budget in rupees/i);
    fireEvent.change(budgetInput, { target: { value: '950000' } });
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });

  it('should trigger onUpdate when occasion is changed', () => {
    const onUpdate = vi.fn();
    render(<ContextIntakePanel context={WEDDING_PRESET} onUpdate={onUpdate} />);

    const occasionSelect = screen.getByLabelText(/Select occasion type/i);
    fireEvent.change(occasionSelect, { target: { value: 'birthday' } });
    expect(onUpdate).toHaveBeenCalledTimes(1);
  });
});
