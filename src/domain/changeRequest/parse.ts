/**
 * @fileoverview Deterministic multi-clause NLP parser for celebration change requests (Hinglish/English).
 */

import { type Result, okResult, errResult } from '../../types/result';

export interface ChangeRequestIntent {
  readonly target: 'budget' | 'timeline' | 'headcount' | 'scope' | 'vendorDelay' | 'costOverrun';
  readonly delta: number;
  readonly unit: 'currency' | 'days' | 'percent' | 'count';
  readonly description?: string | undefined;
  readonly taskId?: string | undefined;
}

export interface ParseIntentsResult {
  readonly intents: readonly ChangeRequestIntent[];
  readonly unrecognizedFragments: readonly string[];
}

export interface ParsedChangeSummaryInput {
  readonly guestDelta?: number | undefined;
  readonly budgetDeltaPercent?: number | undefined;
  readonly timelineDeltaDays?: number | undefined;
  readonly costOverrunPercent?: number | undefined;
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

function parseVendorDelay(lower: string): ChangeRequestIntent | null {
  if (!/delay|delayed|late/i.test(lower)) return null;
  let taskId: string | undefined;
  if (/cater|food|catering/i.test(lower)) taskId = 'task-caterer';
  else if (/venue|hall|banquet|hotel/i.test(lower)) taskId = 'task-venue';
  else if (/photo|videograph/i.test(lower)) taskId = 'task-photographer';
  else if (/decor|mandap/i.test(lower)) taskId = 'task-decorator';
  if (!taskId) return null;
  const days = extractNumber(lower) ?? 5;
  return { target: 'vendorDelay', delta: days, unit: 'days', taskId };
}

function parseHeadcount(lower: string): ChangeRequestIntent | null {
  const isGuest = /guest|people|log|mehman|headcount|attendee|pax/i.test(lower) || /zyada|more|extra/.test(lower);
  if (!isGuest) return null;
  const num = extractNumber(lower);
  if (num === null) return null;
  const isNegative = /kam|less|reduce|cut|ghatao|minus|-/i.test(lower);
  return { target: 'headcount', delta: isNegative ? -num : num, unit: 'count' };
}

function parseTimeline(lower: string): ChangeRequestIntent | null {
  const isTimeline = /week|day|month|earlier|delay|late|pehle|jaldi|hafta|din/i.test(lower);
  if (!isTimeline) return null;
  const rawNum = extractNumber(lower) ?? 1;
  const days = /month|mahina/i.test(lower) ? rawNum * 30 : /week|hafte|hafta/i.test(lower) ? rawNum * 7 : rawNum;
  const isEarlier = /earlier|pehle|jaldi|advance|before/i.test(lower);
  return { target: 'timeline', delta: isEarlier ? -days : days, unit: 'days' };
}

function parseCostOverrun(lower: string): ChangeRequestIntent | null {
  if (!/cost|expense|overrun|kharcha badh|mehenga/i.test(lower)) return null;
  if (/budget/i.test(lower)) return null;
  const num = extractNumber(lower);
  if (num === null) return null;
  return { target: 'costOverrun', delta: num, unit: 'percent' };
}

function parseBudget(lower: string): ChangeRequestIntent | null {
  const isPercent = lower.includes('%') || /percent/i.test(lower);
  const isBudget = isPercent || /budget|lakh|lac|rupee|rs|inr|₹|paisa|dropped/i.test(lower);
  if (!isBudget) return null;
  const num = extractNumber(lower);
  if (num === null) return null;
  const isNegative = /cut|less|reduce|save|kam|ghatao|minus|-|dropped|drop/i.test(lower);
  return { target: 'budget', delta: isNegative ? -num : num, unit: isPercent ? 'percent' : 'currency' };
}

function parseClause(clause: string): ChangeRequestIntent | null {
  const lower = clause.toLowerCase();
  return (
    parseVendorDelay(lower) ??
    parseHeadcount(lower) ??
    parseCostOverrun(lower) ??
    parseBudget(lower) ??
    parseTimeline(lower) ??
    (/venue|caterer|decor|theme|taj|hall|dj|mandap|shifted|switch|change/i.test(lower)
      ? { target: 'scope', delta: 0, unit: 'count', description: clause }
      : null)
  );
}

export function parseAllChangeIntents(rawText: string): ParseIntentsResult {
  const text = rawText.trim();
  if (!text) return { intents: [], unrecognizedFragments: [] };
  const clauses = text.split(/,|;|\band\b|\baur\b/i).map((c) => c.trim()).filter((c) => c.length > 0);
  const intents: ChangeRequestIntent[] = [];
  const unrecognizedFragments: string[] = [];

  for (const clause of clauses) {
    const intent = parseClause(clause);
    if (intent) intents.push(intent);
    else unrecognizedFragments.push(clause);
  }
  return { intents, unrecognizedFragments };
}

export function parseChangeRequest(rawText: string): Result<ChangeRequestIntent, string> {
  const res = parseAllChangeIntents(rawText);
  const first = res.intents[0];
  if (first) return okResult(first);
  return errResult(`Unable to extract actionable intent from: "${rawText.trim()}"`);
}

function formatItem(val: number | undefined, suffix: string): string | null {
  if (!val) return null;
  const sign = val > 0 ? '+' : '';
  return `${sign}${val}${suffix}`;
}

export function formatChangeSummary(summary: ParsedChangeSummaryInput): string {
  const items = [
    formatItem(summary.guestDelta, ' Guests'),
    formatItem(summary.budgetDeltaPercent, '% Budget'),
    formatItem(summary.timelineDeltaDays, 'd Timeline'),
    formatItem(summary.costOverrunPercent, '% Cost Overrun'),
  ].filter((item): item is string => item !== null);
  return items.length > 0 ? `Parsed: ${items.join(', ')}` : '';
}
