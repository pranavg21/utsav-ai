/**
 * @fileoverview Unit tests for TimelineDependencyTab component.
 * Verifies timeline phase rendering, task status toggling, completed/delayed states, and bottleneck alerts.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimelineDependencyTab from '../components/TimelineDependencyTab';
import { WEDDING_PRESET } from '../data/presets';
import { buildTimeline } from '../services/timelineDependencyGraph';
import type { TimelineTask } from '../types/planner';

describe('TimelineDependencyTab component', () => {
  const tasks = buildTimeline(WEDDING_PRESET);

  it('renders critical path timeline and triggers status toggle', () => {
    const onToggleStatus = vi.fn();
    render(<TimelineDependencyTab tasks={tasks} onToggleStatus={onToggleStatus} />);

    expect(screen.getByRole('region', { name: /Timeline dependency graph/i })).toBeDefined();
    expect(screen.getByText('Critical Path Timeline')).toBeDefined();

    const statusButtons = screen.getAllByRole('button', { name: /Toggle status for/i });
    if (statusButtons[0]) {
      fireEvent.click(statusButtons[0]);
    }
    expect(onToggleStatus).toHaveBeenCalledTimes(1);
  });

  it('renders completed tasks and bottleneck alerts with cascade notes', () => {
    const mixedTasks: TimelineTask[] = [
      {
        id: 't-comp',
        title: 'Completed Task',
        phase: 'Foundation',
        daysBeforeEvent: 80,
        delayDays: 0,
        status: 'completed',
        dependsOn: [],
        isBottleneck: false,
        delayImpactNote: '',
      },
      {
        id: 't-delayed',
        title: 'Delayed Bottleneck Task',
        phase: 'Foundation',
        daysBeforeEvent: 60,
        delayDays: 10,
        status: 'delayed',
        dependsOn: ['t-comp'],
        isBottleneck: true,
        delayImpactNote: 'Downstream catering shifted by 10 days.',
      },
    ];

    render(<TimelineDependencyTab tasks={mixedTasks} onToggleStatus={vi.fn()} />);

    expect(screen.getByText('Completed Task')).toBeDefined();
    expect(screen.getByText('Delayed Bottleneck Task')).toBeDefined();
    expect(screen.getByText('Downstream catering shifted by 10 days.')).toBeDefined();
    expect(screen.getByText('(+10d delayed)')).toBeDefined();
  });
});
