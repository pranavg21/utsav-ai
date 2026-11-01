/**
 * @fileoverview Unit tests for aggregateChangePrompt and resolveChangeDeltas.
 */

import { describe, it, expect } from 'vitest';
import { aggregateChangePrompt, resolveChangeDeltas } from '../domain/changeRequest/aggregate';

describe('aggregateChangePrompt domain aggregator', () => {
  it('aggregates multi-clause headcount and percent budget changes', () => {
    const res = aggregateChangePrompt('+50 guests, -10% budget, 2 weeks earlier', 1000000);
    expect(res.guestDelta).toBe(50);
    expect(res.budgetDeltaPercent).toBe(-10);
    expect(res.timelineDeltaDays).toBe(14);
    expect(res.vendorDelay).toBeUndefined();
  });

  it('aggregates currency budget changes against total budget', () => {
    const res = aggregateChangePrompt('1 lakh less budget', 1000000);
    expect(res.budgetDeltaPercent).toBe(-10);
  });

  it('captures vendor delay tasks', () => {
    const res = aggregateChangePrompt('venue delayed by 10 days', 600000);
    expect(res.vendorDelay).toBeDefined();
    expect(res.vendorDelay?.taskId).toBe('task-venue');
    expect(res.vendorDelay?.days).toBe(10);
  });

  it('handles timeline postponement extension', () => {
    const res = aggregateChangePrompt('delay by 5 days', 500000);
    expect(res.timelineDeltaDays).toBe(-5);
  });

  it('handles empty input gracefully', () => {
    const res = aggregateChangePrompt('', 1000000);
    expect(res.guestDelta).toBe(0);
    expect(res.budgetDeltaPercent).toBe(0);
    expect(res.timelineDeltaDays).toBe(0);
    expect(res.vendorDelay).toBeUndefined();
  });
});

describe('resolveChangeDeltas helper', () => {
  it('returns direct payload deltas when explicitly provided', () => {
    const res = resolveChangeDeltas(
      { rawPrompt: 'some prompt', guestDelta: 25, budgetDeltaPercent: 5 },
      1000000
    );
    expect(res.guestDelta).toBe(25);
    expect(res.budgetDeltaPercent).toBe(5);
  });

  it('returns direct timelineDeltaDays when provided', () => {
    const res = resolveChangeDeltas(
      { rawPrompt: 'some prompt', timelineDeltaDays: 7 },
      1000000
    );
    expect(res.timelineDeltaDays).toBe(7);
  });

  it('returns direct vendorDelay when provided', () => {
    const res = resolveChangeDeltas(
      { rawPrompt: 'some prompt', vendorDelay: { taskId: 'task-caterer', days: 5 } },
      1000000
    );
    expect(res.vendorDelay?.taskId).toBe('task-caterer');
    expect(res.vendorDelay?.days).toBe(5);
  });

  it('returns default zero values when rawPrompt is empty and no deltas given', () => {
    const res = resolveChangeDeltas({ rawPrompt: '' }, 1000000);
    expect(res.guestDelta).toBe(0);
    expect(res.budgetDeltaPercent).toBe(0);
    expect(res.timelineDeltaDays).toBe(0);
  });

  it('parses rawPrompt when no direct deltas are provided', () => {
    const res = resolveChangeDeltas(
      { rawPrompt: 'We have 50 more guests and budget dropped 10%' },
      600000
    );
    expect(res.guestDelta).toBe(50);
    expect(res.budgetDeltaPercent).toBe(-10);
  });
});

