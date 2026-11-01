/**
 * @fileoverview Hook integrating Gemini GenAI change request parsing with fallback and dispatch.
 */

import { useState, useCallback } from 'react';
import type { EventContext, ChangeRequestInput } from '../types/planner';
import { parseChangeRequestWithAi } from '../services/gemini/planner';
import { aggregateChangePrompt } from '../domain/changeRequest/aggregate';
import { formatItem } from '../domain/changeRequest/parse';
import type { ProvenanceBadgeData } from '../services/gemini/types';

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
      setIsPending(true);
      try {
        const aiResult = await parseChangeRequestWithAi(context, { rawPrompt });
        const deterministic = aggregateChangePrompt(rawPrompt, context.totalBudget);

        const guestDelta = aiResult.data.guestDelta ?? deterministic.guestDelta;
        const budgetDeltaPercent = aiResult.data.budgetDeltaPercent ?? deterministic.budgetDeltaPercent;
        const timelineDeltaDays = aiResult.data.timelineDeltaDays ?? deterministic.timelineDeltaDays;
        const costOverrunPercent = aiResult.data.costOverrunPercent ?? deterministic.costOverrunPercent;
        const vendorDelay = aiResult.data.vendorDelay ?? deterministic.vendorDelay;

        setLastProvenance(aiResult.provenance);
        setLastResponseJson(JSON.stringify(aiResult.data, null, 2));
        setLastSummary(buildSummaryText(guestDelta, budgetDeltaPercent, timelineDeltaDays, costOverrunPercent));

        onApply({
          rawPrompt,
          guestDelta,
          budgetDeltaPercent,
          timelineDeltaDays,
          ...(costOverrunPercent ? { costOverrunPercent } : {}),
          ...(vendorDelay ? { vendorDelay } : {}),
        });
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { isPending, lastProvenance, lastResponseJson, lastSummary, applyChangeAi };
}
