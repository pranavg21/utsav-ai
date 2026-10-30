/**
 * @fileoverview Unit tests for AssumptionsPanel collapsible section and numeric rate inputs.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AssumptionsPanel } from '../components/AssumptionsPanel';
import { DEFAULT_ASSUMPTIONS } from '../data/assumptions';

describe('AssumptionsPanel', () => {
  it('toggles expansion and triggers onUpdate for rate inputs', () => {
    const onUpdate = vi.fn();
    render(<AssumptionsPanel assumptions={DEFAULT_ASSUMPTIONS} onUpdate={onUpdate} />);

    const toggleBtn = screen.getByRole('button', { name: /Execution Assumptions/i });
    expect(screen.queryByLabelText('Headcount buffer percentage')).toBeNull();

    fireEvent.click(toggleBtn);
    expect(screen.getByLabelText('Headcount buffer percentage')).toBeDefined();

    const bufferInput = screen.getByLabelText('Headcount buffer percentage');
    fireEvent.change(bufferInput, { target: { value: '15' } });
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ headcountBufferPercent: 15 }));

    const peakInput = screen.getByLabelText('Peak season multiplier');
    fireEvent.change(peakInput, { target: { value: '1.2' } });
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ peakSeasonMultiplier: 1.2 }));

    const servicesGst = screen.getByLabelText('Services GST rate');
    fireEvent.change(servicesGst, { target: { value: '12' } });
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ gstRateServices: 12 }));

    const cateringGst = screen.getByLabelText('Catering GST rate');
    fireEvent.change(cateringGst, { target: { value: '18' } });
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ gstRateCatering: 18 }));
  });
});
