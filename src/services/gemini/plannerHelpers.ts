/**
 * @fileoverview Helpers for resolving AI change request outputs with fallback values.
 */

import type { AiChangeRequestResponse } from './schemas';
import type { ParsedChangeResult } from './fallbacks';

function computeBudgetPct(rawAmt: number | undefined | null, totalBudget: number, fallbackPct: number): number {
  if (rawAmt === undefined || rawAmt === null) return fallbackPct;
  return Math.round((rawAmt / totalBudget) * 100);
}

function buildOptionalFields(
  costOverrun?: number,
  currency?: number,
  vendorDelay?: { readonly taskId: string; readonly days: number },
  unrecognized?: readonly string[]
) {
  return {
    ...(costOverrun !== undefined ? { costOverrunPercent: costOverrun } : {}),
    ...(currency !== undefined ? { budgetDeltaCurrency: currency } : {}),
    ...(vendorDelay !== undefined ? { vendorDelay } : {}),
    ...(unrecognized ? { unrecognizedFragments: unrecognized } : {}),
  };
}

/**
 * Merges structured Gemini change response with deterministic fallback fields.
 * @param resultData Structured response from Gemini model.
 * @param fallback Deterministic baseline change result.
 * @param totalBudget Baseline event budget for currency conversions.
 * @returns Fully merged ParsedChangeResult.
 */
export function resolveAiChangeData(
  resultData: AiChangeRequestResponse,
  fallback: ParsedChangeResult,
  totalBudget: number
): ParsedChangeResult {
  const computedPct = computeBudgetPct(resultData.amountDelta, totalBudget, fallback.budgetDeltaPercent);
  const budgetDeltaPercent = resultData.budgetDeltaPercent ?? computedPct;
  const costOverrunPercent = resultData.costOverrunPercent ?? fallback.costOverrunPercent;
  const vendorDelay = resultData.vendorDelay ?? fallback.vendorDelay;
  const extra = buildOptionalFields(costOverrunPercent, fallback.budgetDeltaCurrency, vendorDelay, fallback.unrecognizedFragments);

  return {
    guestDelta: resultData.guestDelta ?? fallback.guestDelta,
    budgetDeltaPercent,
    timelineDeltaDays: resultData.targetDaysDelta ?? fallback.timelineDeltaDays,
    impactSummary: resultData.reasoning || fallback.impactSummary,
    recommendedActions: fallback.recommendedActions,
    ...extra,
  };
}
