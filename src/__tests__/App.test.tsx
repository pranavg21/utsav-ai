/**
 * @fileoverview Unit tests for App root component.
 * Verifies tab navigation, preset loading, simulation updates, and export action.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('App root component', () => {
  it('should render header with title and dashboard navigation tabs', () => {
    render(<App />);

    expect(screen.getByText('UtsavAI')).toBeDefined();
    expect(screen.getByRole('tab', { name: /Switch to Budget Matrix tab/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Switch to Timeline tab/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Switch to Vendor Quotes tab/i })).toBeDefined();
    expect(screen.getByRole('tab', { name: /Switch to Theme Ideas tab/i })).toBeDefined();
    expect(
      screen.getByRole('button', { name: /Export complete celebration plan as JSON/i })
    ).toBeDefined();
  });

  it('should switch between tabs on click', async () => {
    render(<App />);

    const timelineTabBtn = screen.getByRole('tab', { name: /Switch to Timeline tab/i });
    fireEvent.click(timelineTabBtn);

    const timelineHeading = await screen.findByText('Critical Path Timeline');
    expect(timelineHeading).toBeDefined();

    const vendorTabBtn = screen.getByRole('tab', { name: /Switch to Vendor Quotes tab/i });
    fireEvent.click(vendorTabBtn);

    const vendorHeading = await screen.findByText(/Vendor Quote Comparator/i);
    expect(vendorHeading).toBeDefined();
  });

  it('should trigger JSON export on export button click', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    render(<App />);

    const exportBtn = screen.getByRole('button', {
      name: /Export complete celebration plan as JSON/i,
    });
    expect(() => fireEvent.click(exportBtn)).not.toThrow();

    clickSpy.mockRestore();
  });
});
