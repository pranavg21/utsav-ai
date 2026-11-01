/**
 * @fileoverview Clause-level parser helpers for celebration change requests.
 */

import { VENDOR_DELAY_TASK_IDS } from '../timeline/templates';
import { parseIndianAmountMultiplier } from '../shared/indianNumbers';
import type { ChangeRequestIntent } from './parse';

function extractNumber(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(lakh|lac|cr|crore|k)?/i);
  if (!match) return null;
  const numPart = match[1];
  if (!numPart) return null;
  const base = parseFloat(numPart);
  const mult = match[2] ? parseIndianAmountMultiplier(match[2]) : 1;
  return Math.round(base * mult);
}

function parseVendorDelay(lower: string): ChangeRequestIntent | null {
  if (!/delay|delayed|late/i.test(lower)) return null;
  let taskId: string | undefined;
  if (/cater|food|catering/i.test(lower)) taskId = VENDOR_DELAY_TASK_IDS.caterer;
  else if (/venue|hall|banquet|hotel/i.test(lower)) taskId = VENDOR_DELAY_TASK_IDS.venue;
  else if (/photo|videograph/i.test(lower)) taskId = VENDOR_DELAY_TASK_IDS.photographer;
  else if (/decor|mandap/i.test(lower)) taskId = VENDOR_DELAY_TASK_IDS.decorator;
  if (!taskId) return null;
  const days = extractNumber(lower) ?? 5;
  return { target: 'vendorDelay', delta: days, unit: 'days', taskId };
}

function parseHeadcount(lower: string): ChangeRequestIntent | null {
  const isGuest = /guest|people|log|mehman|headcount|attendee|pax/i.test(lower) || /zyada|more|extra/.test(lower);
  if (!isGuest) return null;
  const num = extractNumber(lower);
  if (num === null) return null;
  const isNegative = /kam|less|reduce|cut|ghatao|minus|fewer|drop|-/i.test(lower);
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

/**
 * Parses an individual natural-language clause into a typed ChangeRequestIntent.
 * @param clause Substring clause to analyze.
 * @returns Parsed intent or null if no recognized pattern.
 */
export function parseClause(clause: string): ChangeRequestIntent | null {
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
