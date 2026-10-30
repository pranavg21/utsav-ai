/**
 * @fileoverview High-level Gemini planner integration combining API client with fallbacks and cache.
 */

import type { EventContext, PersonalizedConcept } from '../../types/planner';
import type { ChangeRequestInput } from '../../types/plannerExtended';
import { getCachedResponse, setCachedResponse } from '../../utils/cache';
import { safeJsonParse } from '../../utils/typeGuards';
import {
  buildChangeRequestPrompt,
  buildThemeGenerationPrompt,
} from '../../prompts/celebrationPlannerPrompts';
import { executeGeminiPrompt, getActiveApiKey, getGeminiStatus, setRuntimeApiKey } from './client';
import {
  type ParsedChangeResult,
  buildDeterministicChangeResult,
  buildDeterministicThemes,
} from './fallbacks';

export { getActiveApiKey, getGeminiStatus, setRuntimeApiKey };
export type { ParsedChangeResult };

export async function parseChangeRequest(
  context: EventContext,
  input: ChangeRequestInput
): Promise<ParsedChangeResult> {
  const fallback = buildDeterministicChangeResult(input);
  const cacheKey = `change:${input.rawPrompt}`;
  const cached = getCachedResponse<ParsedChangeResult>(cacheKey);
  if (cached !== null) return cached;

  const prompt = buildChangeRequestPrompt(context, input.rawPrompt);
  const responseText = await executeGeminiPrompt(prompt);
  if (responseText) {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = safeJsonParse<ParsedChangeResult>(jsonMatch[0]);
      if (parsed !== null) {
        setCachedResponse(cacheKey, parsed);
        return parsed;
      }
    }
  }

  setCachedResponse(cacheKey, fallback);
  return fallback;
}

export async function generateThemes(context: EventContext): Promise<PersonalizedConcept[]> {
  const fallback = buildDeterministicThemes(context);
  const cacheKey = `themes:${context.occasion}:${context.totalBudget}`;
  const cached = getCachedResponse<PersonalizedConcept[]>(cacheKey);
  if (cached !== null) return cached;

  const prompt = buildThemeGenerationPrompt(context);
  const responseText = await executeGeminiPrompt(prompt);
  if (responseText) {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = safeJsonParse<PersonalizedConcept[]>(jsonMatch[0]);
      if (parsed !== null) {
        setCachedResponse(cacheKey, parsed);
        return parsed;
      }
    }
  }

  setCachedResponse(cacheKey, fallback);
  return fallback;
}
