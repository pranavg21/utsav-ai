/**
 * @fileoverview Domain aggregator for multi-clause change intents.
 */

import type { ChangeRequestInput } from '../../types/plannerExtended';
import { type ChangeRequestIntent, parseAllChangeIntents } from './parse';

export interface AggregatedChange {
  readonly guestDelta: number;
  readonly budgetDeltaPercent: number;
  readonly timelineDeltaDays: number;
  readonly vendorDelay?: { readonly taskId: string; readonly days: number } | undefined;
}

interface MutableAgg {
  guestDelta: number;
  budgetDeltaPercent: number;
  budgetCurrency: number;
  timelineDeltaDays: number;
  vendorDelay?: { readonly taskId: string; readonly days: number } | undefined;
}

function processSingleIntent(agg: MutableAgg, intent: ChangeRequestIntent): void {
  switch (intent.target) {
    case 'headcount':
      agg.guestDelta += intent.delta;
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
    ...(agg.vendorDelay ? { vendorDelay: agg.vendorDelay } : {}),
  };
}

export function resolveChangeDeltas(payload: ChangeRequestInput, totalBudget: number): AggregatedChange {
  const { guestDelta = 0, budgetDeltaPercent = 0, timelineDeltaDays = 0, vendorDelay } = payload;
  const isDirect = guestDelta !== 0 || budgetDeltaPercent !== 0 || timelineDeltaDays !== 0 || vendorDelay !== undefined;
  if (isDirect || !payload.rawPrompt) {
    return { guestDelta, budgetDeltaPercent, timelineDeltaDays, vendorDelay };
  }
  return aggregateChangePrompt(payload.rawPrompt, totalBudget);
}
