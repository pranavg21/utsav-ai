/**
 * @fileoverview Deterministic multi-clause NLP parser for celebration change requests (Hinglish/English).
 */

import { type Result, okResult, errResult } from '../../types/result';
import { parseClause } from './clauseParsers';

/** Structured intent extracted from a natural-language change clause. */
export interface ChangeRequestIntent {
  readonly target: 'budget' | 'timeline' | 'headcount' | 'scope' | 'vendorDelay' | 'costOverrun';
  readonly delta: number;
  readonly unit: 'currency' | 'days' | 'percent' | 'count';
  readonly description?: string | undefined;
  readonly taskId?: string | undefined;
}

/** Result of parsing multi-clause change prompt into recognized and unrecognized components. */
export interface ParseIntentsResult {
  readonly intents: readonly ChangeRequestIntent[];
  readonly unrecognizedFragments: readonly string[];
}

/** Input summary deltas for formatting human-readable change preview. */
export interface ParsedChangeSummaryInput {
  readonly guestDelta?: number | undefined;
  readonly budgetDeltaPercent?: number | undefined;
  readonly timelineDeltaDays?: number | undefined;
  readonly costOverrunPercent?: number | undefined;
}

/**
 * Parses all natural language clauses from a prompt into structured change intents.
 * @param rawText User input prompt text containing celebration changes.
 * @returns Recognized intents and list of unrecognized text clauses.
 */
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

/**
 * Parses a single change request into the primary actionable intent.
 * @param rawText Natural language prompt text.
 * @returns Result with first detected intent or error message.
 */
export function parseChangeRequest(rawText: string): Result<ChangeRequestIntent, string> {
  const res = parseAllChangeIntents(rawText);
  const first = res.intents[0];
  if (first) return okResult(first);
  return errResult(`Unable to extract actionable intent from: "${rawText.trim()}"`);
}

/**
 * Formats a signed numeric delta value with an appropriate suffix.
 * @param val Numeric delta.
 * @param suffix Unit suffix string.
 * @returns Formatted signed string or null if undefined / zero.
 */
export function formatItem(val: number | undefined, suffix: string): string | null {
  if (!val) return null;
  const sign = val > 0 ? '+' : '';
  return `${sign}${val}${suffix}`;
}

/**
 * Formats a concise human-readable summary string from parsed delta adjustments.
 * @param summary Parsed delta adjustment values.
 * @returns Summary string representing all recognized changes.
 */
export function formatChangeSummary(summary: ParsedChangeSummaryInput): string {
  const items = [
    formatItem(summary.guestDelta, ' Guests'),
    formatItem(summary.budgetDeltaPercent, '% Budget'),
    formatItem(summary.timelineDeltaDays, 'd Timeline'),
    formatItem(summary.costOverrunPercent, '% Cost Overrun'),
  ].filter((item): item is string => item !== null);
  return items.length > 0 ? `Parsed: ${items.join(', ')}` : '';
}
