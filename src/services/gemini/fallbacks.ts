/**
 * @fileoverview Resilient deterministic fallbacks for celebration themes and change requests.
 */

import type { ChangeRequestInput } from '../../types/plannerExtended';
import { parseAllChangeIntents } from '../../domain/changeRequest/parse';
import { aggregateChangePrompt } from '../../domain/changeRequest/aggregate';
import { buildDeterministicThemes } from './themeFallback';

export { buildDeterministicThemes };

/** Structured result of a deterministic celebration change request calculation. */
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

function resolveOptionalDeltas(
  agg: ReturnType<typeof aggregateChangePrompt>,
  input: ChangeRequestInput
): Partial<ParsedChangeResult> {
  const costOverrunPercent = input.costOverrunPercent ?? agg.costOverrunPercent;
  const vendorDelay = input.vendorDelay ?? agg.vendorDelay;
  const budgetDeltaCurrency = agg.budgetCurrency;

  return {
    ...(costOverrunPercent !== undefined && { costOverrunPercent }),
    ...(budgetDeltaCurrency !== undefined && { budgetDeltaCurrency }),
    ...(vendorDelay !== undefined && { vendorDelay }),
  };
}

/**
 * Computes deterministic change deltas when offline or when Gemini response is unavailable.
 * @param input Change request payload containing rawPrompt or explicit overrides.
 * @param totalBudget Baseline event budget for currency-to-percentage conversions.
 * @returns Deterministic change result with calculated deltas and summary note.
 */
export function buildDeterministicChangeResult(
  input: ChangeRequestInput,
  totalBudget = 1000000
): ParsedChangeResult {
  const parsed = parseAllChangeIntents(input.rawPrompt);
  const agg = aggregateChangePrompt(input.rawPrompt, totalBudget);
  const optionalDeltas = resolveOptionalDeltas(agg, input);

  const unrecognizedNote = parsed.unrecognizedFragments.length > 0
    ? ` (Unrecognized: "${parsed.unrecognizedFragments.join('", "')}")`
    : '';

  return {
    guestDelta: input.guestDelta ?? agg.guestDelta,
    budgetDeltaPercent: input.budgetDeltaPercent ?? agg.budgetDeltaPercent,
    timelineDeltaDays: input.timelineDeltaDays ?? agg.timelineDeltaDays,
    ...optionalDeltas,
    impactSummary:
      `Applying: ${input.rawPrompt}. Budget/guest/timeline recalculated deterministically.` +
      unrecognizedNote,
    recommendedActions: [
      'Review updated budget matrix',
      'Check timeline for bottlenecks',
      'Verify vendor capacity',
    ],
    ...(parsed.unrecognizedFragments.length > 0 && {
      unrecognizedFragments: parsed.unrecognizedFragments,
    }),
  };
}
