/**
 * @fileoverview High-level Gemini planner integration combining native structured output with
 * deterministic fallbacks, caching, and provenance tracking.
 */

import type { EventContext, PersonalizedConcept } from '../../types/planner';
import type { ChangeRequestInput } from '../../types/plannerExtended';
import { getCachedResponse, setCachedResponse } from '../../utils/cache';
import {
  buildChangeRequestPrompt,
  buildThemeGenerationPrompt,
} from '../../prompts/celebrationPlannerPrompts';
import { executeStructuredGeminiCall, getActiveApiKey, getGeminiStatus, setRuntimeApiKey } from './client';
import { GEMINI_TEMPERATURES } from './config';
import {
  AiChangeRequestResponseSchema,
  AiPersonalizedIdeasResponseSchema,
} from './schemas';
import type { AiResult } from './types';
import {
  type ParsedChangeResult,
  buildDeterministicChangeResult,
  buildDeterministicThemes,
} from './fallbacks';

export { getActiveApiKey, getGeminiStatus, setRuntimeApiKey };
export type { ParsedChangeResult };

export async function parseChangeRequestWithAi(
  context: EventContext,
  input: ChangeRequestInput
): Promise<AiResult<ParsedChangeResult>> {
  const fallback = buildDeterministicChangeResult(input);
  const cacheKey = `ai:change:${input.rawPrompt}`;
  const cached = getCachedResponse<AiResult<ParsedChangeResult>>(cacheKey);
  if (cached !== null) return cached;

  const prompt = buildChangeRequestPrompt(context, input.rawPrompt);
  const result = await executeStructuredGeminiCall(
    prompt,
    AiChangeRequestResponseSchema,
    GEMINI_TEMPERATURES.parsing
  );

  let output: AiResult<ParsedChangeResult>;
  if (result.success) {
    const data: ParsedChangeResult = {
      guestDelta: result.data.guestDelta ?? fallback.guestDelta,
      budgetDeltaPercent: result.data.amountDelta !== undefined
        ? Math.round((result.data.amountDelta / context.totalBudget) * 100)
        : fallback.budgetDeltaPercent,
      timelineDeltaDays: result.data.targetDaysDelta ?? fallback.timelineDeltaDays,
      impactSummary: result.data.reasoning || fallback.impactSummary,
      recommendedActions: fallback.recommendedActions,
    };
    output = { data, provenance: { source: 'gemini', model: result.model } };
  } else {
    output = { data: fallback, provenance: { source: 'deterministic', reason: result.reason } };
  }

  setCachedResponse(cacheKey, output);
  return output;
}

export async function generateThemesWithAi(
  context: EventContext
): Promise<AiResult<PersonalizedConcept[]>> {
  const fallback = buildDeterministicThemes(context);
  const cacheKey = `ai:themes:${context.occasion}:${context.totalBudget}`;
  const cached = getCachedResponse<AiResult<PersonalizedConcept[]>>(cacheKey);
  if (cached !== null) return cached;

  const prompt = buildThemeGenerationPrompt(context);
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
  } else {
    output = { data: fallback, provenance: { source: 'deterministic', reason: result.reason } };
  }

  setCachedResponse(cacheKey, output);
  return output;
}

export async function parseChangeRequest(
  context: EventContext,
  input: ChangeRequestInput
): Promise<ParsedChangeResult> {
  const result = await parseChangeRequestWithAi(context, input);
  return result.data;
}

export async function generateThemes(
  context: EventContext
): Promise<PersonalizedConcept[]> {
  const result = await generateThemesWithAi(context);
  return result.data;
}
