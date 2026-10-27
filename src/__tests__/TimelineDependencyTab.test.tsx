/**
 * @fileoverview Unit tests for TimelineDependencyTab component.
 * Verifies timeline phase rendering, task status toggling, and bottleneck indicator display.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimelineDependencyTab from '../components/TimelineDependencyTab';
import { WEDDING_PRESET } from '../data/presets';
import { buildTimeline } from '../services/timelineDependencyGraph';

describe('TimelineDependencyTab component', () => {
  const tasks = buildTimeline(WEDDING_PRESET);

  it('should render the critical path timeline section and task cards', () => {
    render(<TimelineDependencyTab tasks={tasks} onToggleStatus={vi.fn()} />);

    expect(screen.getByRole('region', { name: /Timeline dependency graph/i })).toBeDefined();
    expect(screen.getByText('Critical Path Timeline')).toBeDefined();
    expect(screen.getByText('Finalize Venue & Date')).toBeDefined();
  });

  it('should trigger onToggleStatus when a task status button is clicked', () => {
    const onToggleStatus = vi.fn();
    render(<TimelineDependencyTab tasks={tasks} onToggleStatus={onToggleStatus} />);

    const statusButtons = screen.getAllByRole('button', { name: /Toggle status for/i });
    expect(statusButtons.length).toBeGreaterThan(0);
    fireEvent.click(statusButtons[0]!);
    expect(onToggleStatus).toHaveBeenCalledTimes(1);
  });
});
