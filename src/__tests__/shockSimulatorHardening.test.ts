/**
 * @fileoverview Tests for Shock Simulator vendor delay and timeline shock handling (9.4).
 */

import { describe, it, expect } from 'vitest';
import { planReducer, createInitialState } from '../state/planReducer';
import { WEDDING_PRESET } from '../data/presets';

describe('Shock Simulator Venue Delay (9.4)', () => {
  it('applying venue booking delay shock keeps daysUntilEvent 120, sets task-venue to 98, and shifts caterer by 10d', () => {
    const initialState = createInitialState({
      id: 'test-wedding',
      title: 'Wedding',
      context: WEDDING_PRESET,
    });

    const venueBefore = initialState.tasks.find((t) => t.id === 'task-venue');
    const catererBefore = initialState.tasks.find((t) => t.id === 'task-caterer');
    expect(venueBefore?.daysBeforeEvent).toBe(108);
    expect(catererBefore?.daysBeforeEvent).toBe(90);

    const nextState = planReducer(initialState, {
      type: 'APPLY_CHANGE',
      payload: {
        rawPrompt: 'Venue booking delayed by 10 days',
        vendorDelay: { taskId: 'task-venue', days: 10 },
      },
    });

    expect(nextState.context.daysUntilEvent).toBe(120);

    const venueAfter = nextState.tasks.find((t) => t.id === 'task-venue');
    const catererAfter = nextState.tasks.find((t) => t.id === 'task-caterer');

    expect(venueAfter?.daysBeforeEvent).toBe(98);
    expect(catererAfter?.daysBeforeEvent).toBe(80);
  });
});
