/**
 * @fileoverview Unit tests for timeline fixes (9.4, 9.5, 9.6):
 * vendorDelay shock, clearing delays, non-mutating dependent status, and compression preservation.
 */

import { describe, it, expect } from 'vitest';
import { planReducer, createInitialState } from '../state/planReducer';
import { compressTimeline, propagateDelay } from '../domain/timeline/propagate';
import { WEDDING_PRESET } from '../data/presets';

describe('Timeline Hardening (9.4, 9.5, 9.6)', () => {
  it('9.4: shock sends vendorDelay, keeping daysUntilEvent 120, venue 98, caterer 80', () => {
    const state = createInitialState({ id: 'w', title: 'W', context: WEDDING_PRESET });
    const nextState = planReducer(state, {
      type: 'APPLY_CHANGE',
      payload: {
        rawPrompt: 'Venue booking delayed by 10 days',
        vendorDelay: { taskId: 'task-venue', days: 10 },
      },
    });

    expect(nextState.context.daysUntilEvent).toBe(120);
    const venue = nextState.tasks.find((t) => t.id === 'task-venue');
    const caterer = nextState.tasks.find((t) => t.id === 'task-caterer');
    expect(venue?.daysBeforeEvent).toBe(98);
    expect(caterer?.daysBeforeEvent).toBe(80);
  });

  it('9.5: delaying task-venue marks only venue as delayed, dependent isImpacted=true, and clearing returns baseline', () => {
    const state = createInitialState({ id: 'w', title: 'W', context: WEDDING_PRESET });

    // Delay venue by 10 days
    const delayedState = planReducer(state, {
      type: 'SET_TASK_STATUS',
      payload: { taskId: 'task-venue', status: 'delayed', delayDays: 10 },
    });

    const venueDelayed = delayedState.tasks.find((t) => t.id === 'task-venue');
    const catererDelayed = delayedState.tasks.find((t) => t.id === 'task-caterer');
    expect(venueDelayed?.status).toBe('delayed');
    expect(catererDelayed?.status).toBe('pending');
    expect(catererDelayed?.isImpacted).toBe(true);

    // Clear venue delay back to pending
    const clearedState = planReducer(delayedState, {
      type: 'SET_TASK_STATUS',
      payload: { taskId: 'task-venue', status: 'pending', delayDays: 0 },
    });

    const venueCleared = clearedState.tasks.find((t) => t.id === 'task-venue');
    const catererCleared = clearedState.tasks.find((t) => t.id === 'task-caterer');
    expect(venueCleared?.daysBeforeEvent).toBe(108);
    expect(catererCleared?.daysBeforeEvent).toBe(90);
    expect(venueCleared?.status).toBe('pending');
    expect(catererCleared?.status).toBe('pending');
    expect(catererCleared?.isImpacted).toBe(false);
  });

  it('9.6: compression is preserved across subsequent delays (compress 14 then delay 1)', () => {
    const state = createInitialState({ id: 'w', title: 'W', context: WEDDING_PRESET });
    const compressed = compressTimeline(state.tasks, 14);

    const venueComp = compressed.find((t) => t.id === 'task-venue');
    const catererComp = compressed.find((t) => t.id === 'task-caterer');
    expect(venueComp?.daysBeforeEvent).toBe(94);
    expect(catererComp?.daysBeforeEvent).toBe(76);

    const delayed = propagateDelay(compressed, 'task-venue', 1);
    const venueDel = delayed.find((t) => t.id === 'task-venue');
    const catererDel = delayed.find((t) => t.id === 'task-caterer');

    expect(venueDel?.daysBeforeEvent).toBe(93);
    expect(catererDel?.daysBeforeEvent).toBe(75);
  });
});

