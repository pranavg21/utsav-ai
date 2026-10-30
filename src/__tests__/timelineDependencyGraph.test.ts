/**
 * @fileoverview Unit tests for timeline dependency graph, DAG order, and propagation.
 */

import { describe, it, expect } from 'vitest';
import {
  buildTimeline,
  getTopologicalOrder,
  propagateDelay,
  compressTimeline,
  recalculateTimeline,
} from '../services/timelineDependencyGraph';
import type { EventContext, TimelineTask } from '../types/planner';

const TEST_CONTEXT: EventContext = {
  occasion: 'wedding',
  eventName: 'Test Wedding',
  totalBudget: 800000,
  guestCount: 150,
  daysUntilEvent: 120,
  experienceTier: 'grand',
  priorityRanking: ['Venue & Logistics', 'Catering & Hospitality'],
  ageGroups: ['adults'],
  accessibilityNeeds: [],
  mustHaves: [],
};

describe('Timeline DAG & Delay Propagation', () => {
  it('orders prerequisite tasks before dependents', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    const order = getTopologicalOrder(tasks);
    expect(order.indexOf('task-venue')).toBeLessThan(order.indexOf('task-caterer'));
    expect(order.indexOf('task-caterer')).toBeLessThan(order.indexOf('task-rehearsal'));
  });

  it('diamond dependency: A->B, A->C, B->D, C->D shifts D by exactly delayDays (idempotent)', () => {
    const diamond: TimelineTask[] = [
      { id: 'A', title: 'A', phase: 'Foundation', daysBeforeEvent: 40, delayDays: 0, status: 'pending', dependsOn: [], isBottleneck: false, delayImpactNote: '' },
      { id: 'B', title: 'B', phase: 'Vendor Locking', daysBeforeEvent: 30, delayDays: 0, status: 'pending', dependsOn: ['A'], isBottleneck: false, delayImpactNote: '' },
      { id: 'C', title: 'C', phase: 'Vendor Locking', daysBeforeEvent: 25, delayDays: 0, status: 'pending', dependsOn: ['A'], isBottleneck: false, delayImpactNote: '' },
      { id: 'D', title: 'D', phase: 'Final Execution', daysBeforeEvent: 15, delayDays: 0, status: 'pending', dependsOn: ['B', 'C'], isBottleneck: false, delayImpactNote: '' },
    ];

    const delayed = propagateDelay(diamond, 'A', 10);
    const taskD = delayed.find((t) => t.id === 'D');
    expect(taskD?.delayDays).toBe(10);
    expect(taskD?.daysBeforeEvent).toBe(5);

    // Idempotence check: repeating propagation does not compound shift
    const repeated = propagateDelay(delayed, 'A', 10);
    const taskDRepeated = repeated.find((t) => t.id === 'D');
    expect(taskDRepeated?.delayDays).toBe(10);
    expect(taskDRepeated?.daysBeforeEvent).toBe(5);
  });

  it('detects cycles and returns error containing cycle path', () => {
    const cyclic: TimelineTask[] = [
      { id: 'T1', title: 'T1', phase: 'Foundation', daysBeforeEvent: 10, delayDays: 0, status: 'pending', dependsOn: ['T2'], isBottleneck: false, delayImpactNote: '' },
      { id: 'T2', title: 'T2', phase: 'Foundation', daysBeforeEvent: 5, delayDays: 0, status: 'pending', dependsOn: ['T1'], isBottleneck: false, delayImpactNote: '' },
    ];
    const res = recalculateTimeline(cyclic);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('Cycle detected');
      expect(res.error).toContain('T1');
      expect(res.error).toContain('T2');
    }
  });

  it('flags infeasible timeline and sets minimumNoticeDays when deadlines breach 0', () => {
    const tasks = buildTimeline(TEST_CONTEXT);
    // Severe delay beyond deadline
    const delayed = propagateDelay(tasks, 'task-dayof', 15);
    const dayof = delayed.find((t) => t.id === 'task-dayof');
    expect(dayof?.isInfeasible).toBe(true);
    expect(dayof?.minimumNoticeDays).toBeDefined();

    // Timeline compression causing infeasibility
    const compressed = compressTimeline(tasks, 120);
    const breached = compressed.filter((t) => t.isInfeasible);
    expect(breached.length).toBeGreaterThan(0);
    expect(breached[0]?.minimumNoticeDays).toBe(121);
  });
});
