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
} from './schemas';
import type { AiResult } from './types';
import {
  type ParsedChangeResult,
  buildDeterministicChangeResult,
  buildDeterministicThemes,
} from './fallbacks';
import { resolveAiChangeData } from './plannerHelpers';

export { getActiveApiKey, getGeminiStatus, setRuntimeApiKey };
export type { ParsedChangeResult };

/**
 * Parses natural-language celebration changes with Gemini 2.5 Flash, returning structured deltas and provenance.
 * @param context Celebration event context with baseline budget and guest headcount.
 * @param input Change request payload containing raw text prompt.
 * @returns AI result containing parsed change deltas and provenance metadata.
 */
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

/**
 * Parses natural language change request and extracts the computed result data directly.
 * @param context Celebration event context.
 * @param input Change request input.
 * @returns Resolved ParsedChangeResult entity.
 */
export async function parseChangeRequest(
  context: EventContext,
  input: ChangeRequestInput
): Promise<ParsedChangeResult> {
  const result = await parseChangeRequestWithAi(context, input);
  return result.data;
}

/**
 * Generates personalized celebration concepts adapting to demographics and accessibility using Gemini.
 * @param context Event context with occasion, demographics, accessibility needs, and budget tier.
 * @returns AI result containing personalized celebration concepts and provenance metadata.
 */
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

/**
 * Generates personalized celebration themes and returns the concepts directly.
 * @param context Celebration event context.
 * @returns Array of personalized celebration concepts.
 */
export async function generateThemes(context: EventContext): Promise<PersonalizedConcept[]> {
  const result = await generateThemesWithAi(context);
  return result.data;
}
