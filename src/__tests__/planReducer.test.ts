/**
 * @fileoverview Unit tests for planReducer state transitions.
 */
import { describe, it, expect } from 'vitest';
import { planReducer, createInitialState } from '../state/planReducer';
import { WEDDING_PRESET, BIRTHDAY_PRESET } from '../data/presets';
import type { CelebrationPreset } from '../types/planner';

describe('planReducer', () => {
  const initialPreset: CelebrationPreset = {
    id: 'test-wedding',
    title: 'Test Wedding',
    context: WEDDING_PRESET,
  };

  it('initializes state correctly from preset', () => {
    const state = createInitialState(initialPreset);
    expect(state.context.eventName).toBe(initialPreset.context.eventName);
    expect(state.budgetItems.length).toBeGreaterThan(0);
    expect(state.tasks.length).toBeGreaterThan(0);
  });

  it('handles LOAD_PRESET action', () => {
    const secondPreset: CelebrationPreset = {
      id: 'test-birthday',
      title: 'Test Birthday',
      context: BIRTHDAY_PRESET,
    };
    const state = createInitialState(initialPreset);
    const nextState = planReducer(state, { type: 'LOAD_PRESET', payload: secondPreset });
    expect(nextState.context.eventName).toBe(secondPreset.context.eventName);
  });

  it('handles UPDATE_CONTEXT with occasion change', () => {
    const state = createInitialState(initialPreset);
    const nextState = planReducer(state, {
      type: 'UPDATE_CONTEXT',
      payload: { occasion: 'community', guestCount: 150 },
    });
    expect(nextState.context.occasion).toBe('community');
    expect(nextState.context.guestCount).toBe(150);
  });

  it('handles APPLY_CHANGE action with budget, guest and timeline delta', () => {
    const state = createInitialState(initialPreset);
    const nextState = planReducer(state, {
      type: 'APPLY_CHANGE',
      payload: { rawPrompt: 'test change', guestDelta: 20, budgetDeltaPercent: -10, timelineDeltaDays: 5 },
    });
    expect(nextState.context.guestCount).toBe(state.context.guestCount + 20);
    expect(nextState.context.daysUntilEvent).toBe(state.context.daysUntilEvent - 5);
  });

  it('handles SET_TASK_STATUS with delayDays propagation', () => {
    const state = createInitialState(initialPreset);
    const firstTask = state.tasks[0];
    if (!firstTask) throw new Error('Task missing');
    const nextState = planReducer(state, {
      type: 'SET_TASK_STATUS',
      payload: { taskId: firstTask.id, status: 'delayed', delayDays: 3 },
    });
    const updated = nextState.tasks.find((t) => t.id === firstTask.id);
    expect(updated?.status).toBe('delayed');
  });

  it('handles SET_PROJECTED and TOGGLE_VERIFIED budget item actions', () => {
    const state = createInitialState(initialPreset);
    const firstItem = state.budgetItems[0];
    if (!firstItem) throw new Error('Budget item missing');

    const state1 = planReducer(state, {
      type: 'SET_PROJECTED',
      payload: { categoryId: firstItem.id, amount: 99999 },
    });
    expect(state1.budgetItems[0]?.projectedAmount).toBe(99999);

    const state2 = planReducer(state1, {
      type: 'TOGGLE_VERIFIED',
      payload: { categoryId: firstItem.id },
    });
    expect(state2.budgetItems[0]?.isVerifiedQuote).toBe(!firstItem.isVerifiedQuote);
  });

  it('handles APPLY_TRADEOFF action', () => {
    const state = createInitialState(initialPreset);
    const firstItem = state.budgetItems[0];
    if (!firstItem) throw new Error('Budget item missing');

    const nextState = planReducer(state, {
      type: 'APPLY_TRADEOFF',
      payload: {
        scenario: {
          id: 'test-scenario',
          title: 'Test',
          strategySummary: 'Summary',
          revisedTotalSpend: 750000,
          totalSavings: 5000,
          categoryAdjustments: [
            {
              category: firstItem.category,
              previousAmount: firstItem.projectedAmount,
              revisedAmount: 42000,
              deltaAmount: -5000,
              actionNote: 'Reduced',
            },
          ],
        },
      },
    });
    expect(nextState.budgetItems[0]?.projectedAmount).toBe(42000);
  });
});
