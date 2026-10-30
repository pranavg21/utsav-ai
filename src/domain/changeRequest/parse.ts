/**
 * @fileoverview Pure deterministic NLP parser for celebration change requests supporting Hinglish.
 */

import { type Result, okResult, errResult } from '../../types/result';

export interface ChangeRequestIntent {
  readonly target: 'budget' | 'timeline' | 'headcount' | 'scope';
  readonly delta: number;
  readonly unit: 'currency' | 'days' | 'percent' | 'count';
  readonly description?: string | undefined;
}

function parseMultiplier(token: string): number {
  const lower = token.toLowerCase();
  if (lower.includes('lakh') || lower.includes('lac')) return 100000;
  if (lower.includes('k')) return 1000;
  if (lower.includes('cr') || lower.includes('crore')) return 10000000;
  return 1;
}

function extractNumber(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore|k)?/i);
  if (!match) return null;
  const numPart = match[1];
  if (!numPart) return null;
  const base = parseFloat(numPart);
  const mult = match[2] ? parseMultiplier(match[2]) : 1;
  return Math.round(base * mult);
}

function parseHeadcount(lower: string): Result<ChangeRequestIntent, string> | null {
  const isGuest = /guest|people|log|mehman|headcount|attendee/i.test(lower) || /zyada|kam|more|less|extra/.test(lower);
  if (!isGuest || /lakh|budget|rupee|inr|₹|day|week|month|hafta|din/i.test(lower)) return null;

  const num = extractNumber(lower);
  if (num === null) return null;
  const isNegative = /kam|less|reduce|cut|ghatao|minus|-/i.test(lower);
  return okResult({
    target: 'headcount',
    delta: isNegative ? -num : num,
    unit: 'count',
  });
}

function parseTimeline(lower: string): Result<ChangeRequestIntent, string> | null {
  const isTimeline = /week|day|month|earlier|delay|late|pehle|jaldi|hafta|din/i.test(lower);
  if (!isTimeline) return null;

  const isWeeks = /week|hafte|hafta/i.test(lower);
  const isMonths = /month|mahina/i.test(lower);
  const rawNum = extractNumber(lower) ?? 1;
  const days = isMonths ? rawNum * 30 : isWeeks ? rawNum * 7 : rawNum;
  const isEarlier = /earlier|pehle|jaldi|advance|before/i.test(lower);
  return okResult({
    target: 'timeline',
    delta: isEarlier ? -days : days,
    unit: 'days',
  });
}

function parseBudget(lower: string): Result<ChangeRequestIntent, string> | null {
  const isPercent = lower.includes('%') || /percent/i.test(lower);
  const isBudget = isPercent || /budget|lakh|rupee|rs|inr|₹|cost|paisa|kharcha/i.test(lower);
  if (!isBudget) return null;

  const num = extractNumber(lower);
  if (num === null) return null;
  const isNegative = /cut|less|reduce|save|kam|ghatao|minus|-/i.test(lower);
  return okResult({
    target: 'budget',
    delta: isNegative ? -num : num,
    unit: isPercent ? 'percent' : 'currency',
  });
}

export function parseChangeRequest(rawText: string): Result<ChangeRequestIntent, string> {
  const text = rawText.trim();
  if (!text) return errResult('Empty change request input');
  const lower = text.toLowerCase();

  const hcResult = parseHeadcount(lower);
  if (hcResult) return hcResult;

  const bgResult = parseBudget(lower);
  if (bgResult) return bgResult;

  const tlResult = parseTimeline(lower);
  if (tlResult) return tlResult;

  if (/venue|caterer|decor|theme|taj|hall|dj|mandap|shifted|switch|change/i.test(lower)) {
    return okResult({
      target: 'scope',
      delta: 0,
      unit: 'count',
      description: text,
    });
  }

  return errResult(`Unable to extract actionable intent from: "${text}"`);
}
