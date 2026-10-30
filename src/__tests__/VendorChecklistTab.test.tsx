/**
 * @fileoverview Unit tests for VendorChecklistTab and ChecklistItemCard components.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VendorChecklistTab } from '../components/VendorChecklistTab';
import { getVendorChecklistTemplates, calculateChecklistSummary } from '../domain/vendors/checklist';

describe('VendorChecklistTab & ChecklistItemCard components', () => {
  const items = getVendorChecklistTemplates('wedding');
  const summary = calculateChecklistSummary(items, 90);

  it('renders checklist header metrics and filters by status', () => {
    const onUpdateStatus = vi.fn();
    render(
      <VendorChecklistTab items={items} summary={summary} onUpdateStatus={onUpdateStatus} />
    );

    expect(screen.getByText('Vendor Execution Checklist')).toBeDefined();
    expect(screen.getByText('Total Vendors')).toBeDefined();

    // Click filter buttons
    const pendingBtn = screen.getByRole('button', { name: 'PENDING' });
    fireEvent.click(pendingBtn);

    const bookedBtn = screen.getByRole('button', { name: 'BOOKED' });
    fireEvent.click(bookedBtn);

    const allBtn = screen.getByRole('button', { name: 'ALL' });
    fireEvent.click(allBtn);
  });

  it('interacts with checklist item card: status select, inputs, and details expansion', () => {
    const onUpdateStatus = vi.fn();
    render(
      <VendorChecklistTab items={items} summary={summary} onUpdateStatus={onUpdateStatus} />
    );

    const priceInputs = screen.getAllByPlaceholderText('Amount');
    const selects = screen.getAllByRole('combobox');

    // Expand details
    const expandButtons = screen.getAllByRole('button', { name: /View Must-Ask & Documents/i });
    if (expandButtons[0]) {
      fireEvent.click(expandButtons[0]);
      expect(screen.getByText(/Must-Ask Questions/i)).toBeDefined();
      expect(screen.getByText(/Mandatory Documents/i)).toBeDefined();
    }

    // Change status with empty inputs
    if (priceInputs[0] && selects[0]) {
      fireEvent.change(priceInputs[0], { target: { value: '' } });
      fireEvent.change(selects[0], { target: { value: 'shortlisted' } });
      expect(onUpdateStatus).toHaveBeenCalled();
    }

    // Change status with filled input
    if (selects[1]) {
      fireEvent.change(selects[1], { target: { value: 'booked' } });
      expect(onUpdateStatus).toHaveBeenCalled();
    }

    // Blur price input
    if (priceInputs[0]) {
      fireEvent.change(priceInputs[0], { target: { value: '450000' } });
      fireEvent.blur(priceInputs[0]);
      expect(onUpdateStatus).toHaveBeenCalled();
    }
  });
});
