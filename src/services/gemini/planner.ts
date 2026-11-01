/**
 * @fileoverview High-level Gemini planner integration combining native structured output with
 * deterministic fallbacks, caching, and provenance tracking.
 */

import type { EventContext, PersonalizedConcept } from '../../types/planner';
import type { ChangeRequestInput } from '../../types/plannerExtended';
import { getCachedResponse, setCachedResponse, fnv1aHash, SCHEMA_VERSION } from '../../utils/cache';
import {
  buildChangeRequestPrompt,
  buildThemeGenerationPrompt,
} from '../../prompts/celebrationPlannerPrompts';
import { executeStructuredGeminiCall, getActiveApiKey, getGeminiStatus, setRuntimeApiKey } from './client';
import { GEMINI_MODEL_ID, GEMINI_TEMPERATURES } from './config';
import {
  AiChangeRequestResponseSchema,
  AiPersonalizedIdeasResponseSchema,
  type AiChangeRequestResponse,
} from './schemas';
import type { AiResult } from './types';
import {
  type ParsedChangeResult,
  buildDeterministicChangeResult,
  buildDeterministicThemes,
} from './fallbacks';

export { getActiveApiKey, getGeminiStatus, setRuntimeApiKey };
export type { ParsedChangeResult };

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

function resolveAiChangeData(
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

export async function parseChangeRequestWithAi(
  context: EventContext,
  input: ChangeRequestInput
): Promise<AiResult<ParsedChangeResult>> {
  const fallback = buildDeterministicChangeResult(input, context.totalBudget);
  const prompt = buildChangeRequestPrompt(context, input.rawPrompt);
  const cacheKey = fnv1aHash(`${GEMINI_MODEL_ID}:v${SCHEMA_VERSION}:${prompt}`);
  const cached = getCachedResponse<AiResult<ParsedChangeResult>>(cacheKey);
  if (cached !== null) return cached;

  const result = await executeStructuredGeminiCall(
    prompt,
    AiChangeRequestResponseSchema,
    GEMINI_TEMPERATURES.parsing
  );

  let output: AiResult<ParsedChangeResult>;
  if (result.success) {
    const data = resolveAiChangeData(result.data, fallback, context.totalBudget);
    output = { data, provenance: { source: 'gemini', model: result.model } };
    setCachedResponse(cacheKey, output);
  } else {
    output = { data: fallback, provenance: { source: 'deterministic', reason: result.reason } };
  }

  return output;
}

export async function parseChangeRequest(
  context: EventContext,
  input: ChangeRequestInput
): Promise<ParsedChangeResult> {
  const result = await parseChangeRequestWithAi(context, input);
  return result.data;
}

export async function generateThemesWithAi(
  context: EventContext
): Promise<AiResult<PersonalizedConcept[]>> {
  const fallback = buildDeterministicThemes(context);
  const prompt = buildThemeGenerationPrompt(context);
  const cacheKey = fnv1aHash(`${GEMINI_MODEL_ID}:v${SCHEMA_VERSION}:${prompt}`);
  const cached = getCachedResponse<AiResult<PersonalizedConcept[]>>(cacheKey);
  if (cached !== null) return cached;

  const result = await executeStructuredGeminiCall(
    prompt,
    AiPersonalizedIdeasResponseSchema,
    GEMINI_TEMPERATURES.ideas
  );

  let output: AiResult<PersonalizedConcept[]>;
  if (result.success) {
    const data: PersonalizedConcept[] = result.data.map((item, idx) => ({
      id: `ai-theme-${idx + 1}`,
      title: item.title,
      estimatedCostFit: item.estimatedCostFit,
      atmosphereSummary: `${item.description} (${item.culturalSignificance})`,
      multiGenerationalAdaptations: {
        children: item.ageGroupAdaptations.children,
        seniors: item.ageGroupAdaptations.seniors,
        accessibility: item.ageGroupAdaptations.general,
      },
      budgetFriendlyAlternative: item.budgetFriendlyAlternative,
    }));
    output = { data, provenance: { source: 'gemini', model: result.model } };
    setCachedResponse(cacheKey, output);
  } else {
    output = { data: fallback, provenance: { source: 'deterministic', reason: result.reason } };
  }

  return output;
}

export async function generateThemes(context: EventContext): Promise<PersonalizedConcept[]> {
  const result = await generateThemesWithAi(context);
  return result.data;
}
