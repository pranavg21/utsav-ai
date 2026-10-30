/**
 * @fileoverview Table-driven test suite for change request NLP parser (Hinglish and English).
 */

import { describe, it, expect } from 'vitest';
import { parseChangeRequest, type ChangeRequestIntent } from '../domain/changeRequest/parse';

interface TestCase {
  readonly input: string;
  readonly expectedOk: boolean;
  readonly expectedIntent?: Partial<ChangeRequestIntent>;
}

describe('parseChangeRequest NLP Engine', () => {
  const cases: readonly TestCase[] = [
    { input: '50 zyada', expectedOk: true, expectedIntent: { target: 'headcount', delta: 50, unit: 'count' } },
    { input: '50 more guests', expectedOk: true, expectedIntent: { target: 'headcount', delta: 50, unit: 'count' } },
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
});
