/**
 * @fileoverview Table-driven test suite for change request NLP parser (Hinglish and English).
 * Validates headcount negative markers, vendor delay task mapping, and template consistency (10.4).
 */

import { describe, it, expect } from 'vitest';
import { parseChangeRequest, type ChangeRequestIntent } from '../domain/changeRequest/parse';
import {
  VENDOR_DELAY_TASK_IDS,
  WEDDING_TASK_TEMPLATES,
  BIRTHDAY_TASK_TEMPLATES,
  COMMUNITY_TASK_TEMPLATES,
} from '../domain/timeline/templates';
import { planReducer, createInitialState } from '../state/planReducer';
import { WEDDING_PRESET } from '../data/presets';

interface TestCase {
  readonly input: string;
  readonly expectedOk: boolean;
  readonly expectedIntent?: Partial<ChangeRequestIntent>;
}

describe('parseChangeRequest NLP Engine (10.4)', () => {
  const cases: readonly TestCase[] = [
    { input: '50 zyada', expectedOk: true, expectedIntent: { target: 'headcount', delta: 50, unit: 'count' } },
    { input: '50 more guests', expectedOk: true, expectedIntent: { target: 'headcount', delta: 50, unit: 'count' } },
    { input: '30 fewer guests', expectedOk: true, expectedIntent: { target: 'headcount', delta: -30, unit: 'count' } },
    { input: '20 log kam karo', expectedOk: true, expectedIntent: { target: 'headcount', delta: -20, unit: 'count' } },
    { input: 'cut 30 attendees', expectedOk: true, expectedIntent: { target: 'headcount', delta: -30, unit: 'count' } },
    { input: '1 lakh less', expectedOk: true, expectedIntent: { target: 'budget', delta: -100000, unit: 'currency' } },
    { input: 'kam karo 2 lakh', expectedOk: true, expectedIntent: { target: 'budget', delta: -200000, unit: 'currency' } },
    { input: 'increase budget by 50k', expectedOk: true, expectedIntent: { target: 'budget', delta: 50000, unit: 'currency' } },
    { input: 'add 1.5 lakh to budget', expectedOk: true, expectedIntent: { target: 'budget', delta: 150000, unit: 'currency' } },
    { input: '10% cut', expectedOk: true, expectedIntent: { target: 'budget', delta: -10, unit: 'percent' } },
    { input: '-15% budget reduction', expectedOk: true, expectedIntent: { target: 'budget', delta: -15, unit: 'percent' } },
    { input: '2 weeks earlier', expectedOk: true, expectedIntent: { target: 'timeline', delta: -14, unit: 'days' } },
    { input: '2 hafte pehle', expectedOk: true, expectedIntent: { target: 'timeline', delta: -14, unit: 'days' } },
    { input: 'delay by 10 days', expectedOk: true, expectedIntent: { target: 'timeline', delta: 10, unit: 'days' } },
    { input: '10 din delay', expectedOk: true, expectedIntent: { target: 'timeline', delta: 10, unit: 'days' } },
    { input: 'shifted venue to Taj Palace', expectedOk: true, expectedIntent: { target: 'scope', delta: 0, unit: 'count' } },
    { input: 'switch caterer to Haldirams', expectedOk: true, expectedIntent: { target: 'scope', delta: 0, unit: 'count' } },
    { input: '', expectedOk: false },
    { input: '   ', expectedOk: false },
    { input: 'random gibberish qwerty', expectedOk: false },
  ];

  cases.forEach(({ input, expectedOk, expectedIntent }, idx) => {
    it(`evaluates case #${idx + 1}: "${input}"`, () => {
      const res = parseChangeRequest(input);
      expect(res.ok).toBe(expectedOk);
      if (expectedOk && res.ok && expectedIntent) {
        if (expectedIntent.target) expect(res.value.target).toBe(expectedIntent.target);
        if (expectedIntent.delta !== undefined) expect(res.value.delta).toBe(expectedIntent.delta);
        if (expectedIntent.unit) expect(res.value.unit).toBe(expectedIntent.unit);
      }
    });
  });

  it('shifts task-photo by 5 days for "photographer delayed by 5 days"', () => {
    const initialState = createInitialState({ id: 'test', title: 'Wedding', context: WEDDING_PRESET });
    const baseline = initialState.tasks.find((t) => t.id === 'task-photo')?.delayDays ?? 0;
    const nextState = planReducer(initialState, {
      type: 'APPLY_CHANGE',
      payload: { rawPrompt: 'photographer delayed by 5 days' },
    });
    const updated = nextState.tasks.find((t) => t.id === 'task-photo');
    expect(updated?.delayDays).toBe(baseline + 5);
  });

  it('shifts task-decor by 3 days for "decorator delayed by 3 days"', () => {
    const initialState = createInitialState({ id: 'test', title: 'Wedding', context: WEDDING_PRESET });
    const baseline = initialState.tasks.find((t) => t.id === 'task-decor')?.delayDays ?? 0;
    const nextState = planReducer(initialState, {
      type: 'APPLY_CHANGE',
      payload: { rawPrompt: 'decorator delayed by 3 days' },
    });
    const updated = nextState.tasks.find((t) => t.id === 'task-decor');
    expect(updated?.delayDays).toBe(baseline + 3);
  });

  it('ensures each mapped vendor delay task ID exists in every occasion template', () => {
    const occasions = [WEDDING_TASK_TEMPLATES, BIRTHDAY_TASK_TEMPLATES, COMMUNITY_TASK_TEMPLATES];
    const requiredTaskIds = Object.values(VENDOR_DELAY_TASK_IDS);
    for (const templateList of occasions) {
      for (const taskId of requiredTaskIds) {
        expect(templateList.some((t) => t.id === taskId)).toBe(true);
      }
    }
  });
});
