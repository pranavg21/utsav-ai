/**
 * @fileoverview Bulletproof deterministic fallbacks for celebration themes and change requests.
 */

import type { ChangeRequestInput } from '../../types/plannerExtended';
import { type ChangeRequestIntent, parseAllChangeIntents } from '../../domain/changeRequest/parse';
import { buildDeterministicThemes } from './themeFallback';

export { buildDeterministicThemes };

export interface ParsedChangeResult {
  readonly guestDelta: number;
  readonly budgetDeltaPercent: number;
  readonly timelineDeltaDays: number;
  readonly budgetDeltaCurrency?: number | undefined;
  readonly costOverrunPercent?: number | undefined;
  readonly vendorDelay?: { readonly taskId: string; readonly days: number } | undefined;
  readonly impactSummary: string;
  readonly recommendedActions: readonly string[];
  readonly unrecognizedFragments?: readonly string[] | undefined;
}

interface AggregatedIntents {
  guestDelta?: number | undefined;
  budgetDeltaPercent?: number | undefined;
  budgetCurrency?: number | undefined;
  timelineDeltaDays?: number | undefined;
  costOverrunPercent?: number | undefined;
  vendorDelay?: { readonly taskId: string; readonly days: number } | undefined;
}

function applyBudgetIntent(agg: AggregatedIntents, intent: ChangeRequestIntent): void {
  if (intent.unit === 'percent') agg.budgetDeltaPercent = (agg.budgetDeltaPercent ?? 0) + intent.delta;
  else agg.budgetCurrency = (agg.budgetCurrency ?? 0) + intent.delta;
}

function applyTimelineIntent(agg: AggregatedIntents, delta: number): void {
  const days = delta < 0 ? Math.abs(delta) : -delta;
  agg.timelineDeltaDays = (agg.timelineDeltaDays ?? 0) + days;
}

function processIntent(agg: AggregatedIntents, intent: ChangeRequestIntent): void {
  switch (intent.target) {
    case 'headcount': agg.guestDelta = (agg.guestDelta ?? 0) + intent.delta; break;
    case 'costOverrun': agg.costOverrunPercent = (agg.costOverrunPercent ?? 0) + intent.delta; break;
    case 'budget': applyBudgetIntent(agg, intent); break;
    case 'timeline': applyTimelineIntent(agg, intent.delta); break;
    case 'vendorDelay': if (intent.taskId) agg.vendorDelay = { taskId: intent.taskId, days: intent.delta }; break;
  }
}

function resolveBudgetPercent(inputVal?: number, aggPct?: number, aggCurr?: number, totalBudget = 1000000): number {
  if (inputVal !== undefined) return inputVal;
  if (aggPct !== undefined) return aggPct;
  if (aggCurr !== undefined && totalBudget > 0) return Math.round((aggCurr / totalBudget) * 100);
  return 0;
}

function fallbackNum(val?: number, agg?: number, def = 0): number {
  if (val !== undefined) return val;
  if (agg !== undefined) return agg;
  return def;
}

export function buildDeterministicChangeResult(input: ChangeRequestInput, totalBudget = 1000000): ParsedChangeResult {
  const parsed = parseAllChangeIntents(input.rawPrompt);
  const agg: AggregatedIntents = {};
  for (const intent of parsed.intents) processIntent(agg, intent);

  const guestDelta = fallbackNum(input.guestDelta, agg.guestDelta, 0);
  const budgetDeltaPercent = resolveBudgetPercent(input.budgetDeltaPercent, agg.budgetDeltaPercent, agg.budgetCurrency, totalBudget);
  const timelineDeltaDays = fallbackNum(input.timelineDeltaDays, agg.timelineDeltaDays, 0);
  const costOverrunPercent = input.costOverrunPercent ?? agg.costOverrunPercent;
  const vendorDelay = input.vendorDelay ?? agg.vendorDelay;
  const budgetDeltaCurrency = agg.budgetCurrency;

  const unrecognizedNote = parsed.unrecognizedFragments.length > 0
    ? ` (Unrecognized: "${parsed.unrecognizedFragments.join('", "')}")`
    : '';

  return {
    guestDelta,
    budgetDeltaPercent,
    timelineDeltaDays,
    ...(costOverrunPercent !== undefined && { costOverrunPercent }),
    ...(budgetDeltaCurrency !== undefined && { budgetDeltaCurrency }),
    ...(vendorDelay !== undefined && { vendorDelay }),
    impactSummary: `Applying: ${input.rawPrompt}. Budget/guest/timeline recalculated deterministically.${unrecognizedNote}`,
    recommendedActions: ['Review updated budget matrix', 'Check timeline for bottlenecks', 'Verify vendor capacity'],
    ...(parsed.unrecognizedFragments.length > 0 && { unrecognizedFragments: parsed.unrecognizedFragments }),
  };
}
