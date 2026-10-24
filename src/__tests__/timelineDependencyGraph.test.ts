/**
 * @fileoverview Unit tests for the Timeline Dependency Graph service.
 * Tests topological ordering, delay propagation/cascade, and timeline compression.
 */

import { describe, it, expect } from 'vitest';
import {
  buildTimeline,
  propagateDelay,
  compressTimeline,
  getTopologicalOrder,
} from '../services/timelineDependencyGraph';
import type { EventContext } from '../types/planner';

/** Test context matching the SME benchmark scenario. */
const TEST_CONTEXT: EventContext = {
  occasion: 'wedding',
  eventName: 'Test Wedding',
  totalBudget: 800000,
  guestCount: 200,
  daysUntilEvent: 120,
  experienceTier: 'grand',
  priorityRanking: [
    'Catering & Hospitality', 'Venue & Logistics', 'Photography & Media',
    'Decor & Ambience', 'Entertainment & Rituals', 'Contingency Reserve',
  ],
  ageGroups: ['adults'],
  accessibilityNeeds: [],
  mustHaves: [],
};

describe('buildTimeline', () => {
  it('should generate 10 timeline tasks', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    expect(tasks).toHaveLength(10);
  });

  it('should set all tasks as pending with zero delay', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    for (const task of tasks) {
      expect(task.status).toBe('pending');
      expect(task.delayDays).toBe(0);
      expect(task.isBottleneck).toBe(false);
    }
  });

  it('should compute daysBeforeEvent proportional to timeline', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    const venue = tasks.find((t) => t.id === 'task-venue')!;
    expect(venue.daysBeforeEvent).toBeGreaterThan(100);
  });
});

describe('getTopologicalOrder', () => {
  it('should return task-venue before its dependents', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    const order = getTopologicalOrder(tasks);
    const venueIdx = order.indexOf('task-venue');
    const catererIdx = order.indexOf('task-caterer');
    const decorIdx = order.indexOf('task-decor');
    const inviteIdx = order.indexOf('task-invite');
    expect(venueIdx).toBeLessThan(catererIdx);
    expect(venueIdx).toBeLessThan(decorIdx);
    expect(venueIdx).toBeLessThan(inviteIdx);
  });

  it('should return all 10 task IDs', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    const order = getTopologicalOrder(tasks);
    expect(order).toHaveLength(10);
  });
});

describe('propagateDelay', () => {
  it('should cascade venue delay to downstream tasks', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    const delayed = propagateDelay(tasks, 'task-venue', 10);
    const venue = delayed.find((t) => t.id === 'task-venue')!;
    expect(venue.status).toBe('delayed');
    expect(venue.delayDays).toBe(10);

    const caterer = delayed.find((t) => t.id === 'task-caterer')!;
    expect(caterer.isBottleneck).toBe(true);
    expect(caterer.delayImpactNote).toContain('10d');
  });

  it('should shift downstream daysBeforeEvent when delayed', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    const catererBefore = tasks.find((t) => t.id === 'task-caterer')!.daysBeforeEvent;
    const delayed = propagateDelay(tasks, 'task-venue', 10);
    const catererAfter = delayed.find((t) => t.id === 'task-caterer')!.daysBeforeEvent;
    expect(catererAfter).toBeLessThan(catererBefore);
  });

  it('should handle non-existent task ID gracefully', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    const result = propagateDelay(tasks, 'task-nonexistent', 10);
    expect(result).toEqual(tasks);
  });
});

describe('compressTimeline', () => {
  it('should reduce all task deadlines by compression days', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    const compressed = compressTimeline(tasks, 14);
    for (let i = 0; i < tasks.length; i++) {
      const expected = Math.max(1, tasks[i]!.daysBeforeEvent - 14);
      expect(compressed[i]!.daysBeforeEvent).toBe(expected);
    }
  });

  it('should never produce daysBeforeEvent less than 1', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    const compressed = compressTimeline(tasks, 500);
    for (const task of compressed) {
      expect(task.daysBeforeEvent).toBeGreaterThanOrEqual(1);
    }
  });
});
