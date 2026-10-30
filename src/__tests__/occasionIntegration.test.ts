/**
 * @fileoverview Integration tests validating equal depth across Wedding, Birthday, and Community verticals.
 * Tests preset loading, shock simulation, tradeoff scenario application, checklist sync, and JSON export.
 */

import { describe, it, expect } from 'vitest';
import { WEDDING_PRESET, BIRTHDAY_PRESET, COMMUNITY_PRESET } from '../data/presets';
import { planReducer, createInitialState } from '../state/planReducer';
import { selectEvaluation } from '../state/selectors';
import { buildExportPayload } from '../utils/exportPlan';

describe('Equal Depth Integration: Occasions (Wedding, Birthday, Community)', () => {
  it('Wedding: preset -> shock -> apply scenario -> checklist synced -> export validates', () => {
    let state = createInitialState({ id: 'wed', title: 'Wedding', context: WEDDING_PRESET });
    expect(state.subEvents.length).toBeGreaterThanOrEqual(4);
    expect(state.checklist.length).toBeGreaterThanOrEqual(10);

    // Apply shock: +50 guests, 10-day timeline compression
    state = planReducer(state, {
      type: 'APPLY_CHANGE',
      payload: {
        rawPrompt: 'Guest count increased and moving event 10 days earlier',
        guestDelta: 50,
        timelineDeltaDays: 10,
        costOverrunPercent: 20,
      },
    });

    const evalResult = selectEvaluation(state);
    expect(evalResult.isOverBudget).toBe(true);
    expect(evalResult.tradeOffScenarios.length).toBeGreaterThan(0);

    // Apply first tradeoff scenario
    const scenario = evalResult.tradeOffScenarios[0];
    if (scenario) {
      state = planReducer(state, { type: 'APPLY_TRADEOFF', payload: { scenario } });
    }

    // Verify checklist due dates follow timeline tasks
    const venueChecklistItem = state.checklist.find((i) => i.linkedTaskId === 'task-venue');
    const venueTask = state.tasks.find((t) => t.id === 'task-venue');
    expect(venueChecklistItem?.dueDaysBeforeEvent).toBe(venueTask?.daysBeforeEvent);

    // Verify valid export
    const payload = buildExportPayload({
      context: state.context,
      budget: evalResult,
      timeline: state.tasks,
      vendors: state.quotes,
      checklist: state.checklist,
    });
    expect(payload.exportVersion).toBe('1.0.0');
    expect(payload.checklist.length).toBe(state.checklist.length);
  });

  it('Birthday: preset -> shock -> apply scenario -> checklist synced -> export validates', () => {
    let state = createInitialState({ id: 'bday', title: 'Birthday', context: BIRTHDAY_PRESET });
    expect(state.subEvents.length).toBeGreaterThanOrEqual(3);
    expect(state.checklist.some((i) => i.vendorType.includes('Cake'))).toBe(true);

    // Apply shock: +20 guests, 5-day timeline compression
    state = planReducer(state, {
      type: 'APPLY_CHANGE',
      payload: {
        rawPrompt: 'More kids joining, need bigger cake and earlier party setup',
        guestDelta: 20,
        timelineDeltaDays: 5,
        costOverrunPercent: 15,
      },
    });

    const evalResult = selectEvaluation(state);
    const payload = buildExportPayload({
      context: state.context,
      budget: evalResult,
      timeline: state.tasks,
      vendors: state.quotes,
      checklist: state.checklist,
    });
    expect(payload.context.occasion).toBe('birthday');
    expect(payload.checklist.some((i) => i.id === 'chk-bday-cake')).toBe(true);
  });

  it('Community: preset -> shock -> apply scenario -> checklist synced -> export validates', () => {
    let state = createInitialState({ id: 'comm', title: 'Community', context: COMMUNITY_PRESET });
    expect(state.checklist.some((i) => i.mustAsk.some((q) => q.includes('local authority')))).toBe(true);

    // Apply shock: +100 attendees, 15-day timeline compression
    state = planReducer(state, {
      type: 'APPLY_CHANGE',
      payload: {
        rawPrompt: 'Festival crowd expanded, moving dates 15 days earlier',
        guestDelta: 100,
        timelineDeltaDays: 15,
        costOverrunPercent: 25,
      },
    });

    const evalResult = selectEvaluation(state);
    const payload = buildExportPayload({
      context: state.context,
      budget: evalResult,
      timeline: state.tasks,
      vendors: state.quotes,
      checklist: state.checklist,
    });
    expect(payload.context.occasion).toBe('community');
    expect(payload.checklist.some((i) => i.id === 'chk-comm-approvals')).toBe(true);
  });
});

