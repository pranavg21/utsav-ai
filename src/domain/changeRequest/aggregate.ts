/**
 * @fileoverview Domain aggregator for multi-clause change intents.
 */

import type { ChangeRequestInput } from '../../types/plannerExtended';
import { type ChangeRequestIntent, parseAllChangeIntents } from './parse';

/** Aggregated delta modifications extracted from a natural-language change request. */
export interface AggregatedChange {
  readonly guestDelta: number;
  readonly budgetDeltaPercent: number;
  readonly timelineDeltaDays: number;
  readonly budgetCurrency?: number | undefined;
  readonly costOverrunPercent?: number | undefined;
  readonly vendorDelay?: { readonly taskId: string; readonly days: number } | undefined;
}

interface MutableAgg {
  guestDelta: number;
  budgetDeltaPercent: number;
  budgetCurrency: number;
  timelineDeltaDays: number;
  costOverrunPercent?: number | undefined;
  vendorDelay?: { readonly taskId: string; readonly days: number } | undefined;
}

function processSingleIntent(agg: MutableAgg, intent: ChangeRequestIntent): void {
  switch (intent.target) {
    case 'headcount':
      agg.guestDelta += intent.delta;
      break;
    case 'costOverrun':
      agg.costOverrunPercent = (agg.costOverrunPercent ?? 0) + intent.delta;
      break;
    case 'budget':
      if (intent.unit === 'percent') {
        agg.budgetDeltaPercent += intent.delta;
      } else {
        agg.budgetCurrency += intent.delta;
      }
      break;
    case 'timeline':
      agg.timelineDeltaDays += (intent.delta < 0 ? Math.abs(intent.delta) : -intent.delta);
      break;
    case 'vendorDelay':
      if (intent.taskId) agg.vendorDelay = { taskId: intent.taskId, days: intent.delta };
      break;
  }
}

/**
 * Parses and aggregates multi-clause natural language change prompts into unified deltas.
 * @param rawPrompt User natural language text describing event changes.
 * @param totalBudget Baseline total budget used for converting currency deltas to percentages.
 * @returns Combined delta adjustments across headcount, budget, timeline, and vendor delays.
 * @example
 * ```ts
 * const change = aggregateChangePrompt('We have 50 more guests and budget dropped 10%', 800000);
 * // change.guestDelta === 50, change.budgetDeltaPercent === -10
 * ```
 */
export function aggregateChangePrompt(rawPrompt: string, totalBudget = 1000000): AggregatedChange {
  const parsed = parseAllChangeIntents(rawPrompt);
  const agg: MutableAgg = { guestDelta: 0, budgetDeltaPercent: 0, budgetCurrency: 0, timelineDeltaDays: 0 };
  for (const intent of parsed.intents) {
    processSingleIntent(agg, intent);
  }
  let budgetPct = agg.budgetDeltaPercent;
  if (agg.budgetCurrency !== 0 && totalBudget > 0) {
    budgetPct += Math.round((agg.budgetCurrency / totalBudget) * 100);
  }
  return {
    guestDelta: agg.guestDelta,
    budgetDeltaPercent: budgetPct,
    timelineDeltaDays: agg.timelineDeltaDays,
    ...(agg.budgetCurrency !== 0 ? { budgetCurrency: agg.budgetCurrency } : {}),
    ...(agg.costOverrunPercent ? { costOverrunPercent: agg.costOverrunPercent } : {}),
    ...(agg.vendorDelay ? { vendorDelay: agg.vendorDelay } : {}),
  };
}

function hasDirectDeltas(payload: ChangeRequestInput): boolean {
  if (payload.guestDelta || payload.budgetDeltaPercent) return true;
  if (payload.timelineDeltaDays || payload.costOverrunPercent) return true;
  return payload.vendorDelay !== undefined;
}

/**
 * Resolves change deltas either from explicit payload fields or by parsing rawPrompt.
 * @param payload Change request input object containing raw prompt or direct deltas.
 * @param totalBudget Baseline total budget used for converting currency deltas.
 * @returns Unified aggregated change deltas.
 */
export function resolveChangeDeltas(payload: ChangeRequestInput, totalBudget: number): AggregatedChange {
  if (hasDirectDeltas(payload) || !payload.rawPrompt) {
    const { guestDelta = 0, budgetDeltaPercent = 0, timelineDeltaDays = 0, vendorDelay, costOverrunPercent = 0 } = payload;
    return {
      guestDelta,
      budgetDeltaPercent,
      timelineDeltaDays,
      ...(vendorDelay !== undefined && { vendorDelay }),
      ...(costOverrunPercent !== 0 && { costOverrunPercent }),
    };
  }
  return aggregateChangePrompt(payload.rawPrompt, totalBudget);
}
