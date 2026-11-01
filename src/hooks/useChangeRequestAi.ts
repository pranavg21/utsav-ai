/**
 * @fileoverview Hook integrating Gemini GenAI change request parsing with fallback and dispatch.
 */

import { useState, useCallback } from 'react';
import type { EventContext, ChangeRequestInput } from '../types/planner';
import { parseChangeRequestWithAi } from '../services/gemini/planner';
import { aggregateChangePrompt } from '../domain/changeRequest/aggregate';
import { formatItem } from '../domain/changeRequest/parse';
import type { ProvenanceBadgeData } from '../services/gemini/types';

/** Return signature for the useChangeRequestAi natural language parsing hook. */
export interface UseChangeRequestAiReturn {
  readonly isPending: boolean;
  readonly lastProvenance: ProvenanceBadgeData | null;
  readonly lastResponseJson: string | null;
  readonly lastSummary: string | null;
  readonly applyChangeAi: (
    context: EventContext,
    rawPrompt: string,
    onApply: (input: ChangeRequestInput) => void
  ) => Promise<void>;
}

function buildSummaryText(g: number, b: number, t: number, c?: number): string | null {
  const parts = [
    formatItem(g, ' Guests'),
    formatItem(b, '% Budget'),
    formatItem(t, 'd Timeline'),
    formatItem(c, '% Cost Overrun'),
  ].filter((p): p is string => p !== null);
  return parts.length > 0 ? `Parsed: ${parts.join(', ')}` : null;
}

/**
 * Custom hook providing asynchronous natural-language change parsing with GenAI provenance.
 * @returns Object with pending state, last provenance, raw JSON response, summary text, and apply callback.
 */
export function useChangeRequestAi(): UseChangeRequestAiReturn {
  const [isPending, setIsPending] = useState(false);
  const [lastProvenance, setLastProvenance] = useState<ProvenanceBadgeData | null>(null);
  const [lastResponseJson, setLastResponseJson] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<string | null>(null);

  const applyChangeAi = useCallback(
    async (
      context: EventContext,
      rawPrompt: string,
      onApply: (input: ChangeRequestInput) => void
    ): Promise<void> => {
      const trimmed = rawPrompt.trim();
      if (!trimmed || isPending) return;

      setIsPending(true);
      try {
        const aiResult = await parseChangeRequestWithAi(context, { rawPrompt: trimmed });
        const deterministic = aggregateChangePrompt(trimmed, context.totalBudget);

        const guestDelta = aiResult.data.guestDelta ?? deterministic.guestDelta;
        const budgetDeltaPercent = aiResult.data.budgetDeltaPercent ?? deterministic.budgetDeltaPercent;
        const timelineDeltaDays = aiResult.data.timelineDeltaDays ?? deterministic.timelineDeltaDays;
        const costOverrunPercent = aiResult.data.costOverrunPercent ?? deterministic.costOverrunPercent;
        const vendorDelay = aiResult.data.vendorDelay ?? deterministic.vendorDelay;

        setLastProvenance(aiResult.provenance);
        setLastResponseJson(JSON.stringify(aiResult.data, null, 2));
        setLastSummary(buildSummaryText(guestDelta, budgetDeltaPercent, timelineDeltaDays, costOverrunPercent));

        onApply({
          rawPrompt: trimmed,
          guestDelta,
          budgetDeltaPercent,
          timelineDeltaDays,
          ...(costOverrunPercent !== undefined && { costOverrunPercent }),
          ...(vendorDelay !== undefined && { vendorDelay }),
        });
      } finally {
        setIsPending(false);
      }
    },
    [isPending]
  );

  return { isPending, lastProvenance, lastResponseJson, lastSummary, applyChangeAi };
}
