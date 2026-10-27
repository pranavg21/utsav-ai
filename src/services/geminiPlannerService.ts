/**
 * @fileoverview Gemini 2.5 Flash integration with bulletproof deterministic fallback.
 * If API key is missing or calls fail, all features work via rich local computation.
 */

import type { EventContext, PersonalizedConcept, ChangeRequestInput } from '../types/planner';
import { getCachedResponse, setCachedResponse } from '../utils/cache';
import { checkRateLimit } from '../utils/security';
import { safeJsonParse } from '../utils/typeGuards';
import {
  buildChangeRequestPrompt,
  buildThemeGenerationPrompt,
} from '../prompts/celebrationPlannerPrompts';

/** Rate limit action key for Gemini API calls. */
const GEMINI_RATE_KEY = 'gemini-api';

/** Tracks whether a live Gemini connection has been validated. */
let isGeminiConnected = false;

/** Runtime API key that can be set via the UI modal. */
let runtimeApiKey = '';

/**
 * Sets the Gemini API key at runtime (e.g., from an evaluator modal input).
 *
 * @param key - The API key string to use for Gemini calls.
 */
export function setRuntimeApiKey(key: string): void {
  runtimeApiKey = key.trim();
  isGeminiConnected = false;
}

/**
 * Returns the currently active API key string.
 *
 * @returns The active key or empty string.
 */
export function getActiveApiKey(): string {
  return getApiKey();
}

/**
 * Returns the active API key (runtime override or env variable).
 *
 * @returns The API key string or empty string if not configured.
 */
function getApiKey(): string {
  if (runtimeApiKey) { return runtimeApiKey; }
  try {
    if (import.meta.env.MODE === 'test') { return ''; }
    return import.meta.env.VITE_GEMINI_API_KEY ?? '';
  }
  catch { return ''; }
}

/**
 * Returns whether Gemini is currently connected and validated.
 *
 * @returns True if live Gemini connection is active.
 */
export function getGeminiStatus(): boolean {
  return isGeminiConnected && getApiKey().length > 0;
}

/**
 * Calls Gemini API with structured JSON parsing, falling back to deterministic engine.
 *
 * @param prompt - The formatted prompt string.
 * @param cacheKey - Cache key for dedup.
 * @returns Parsed JSON response from Gemini or deterministic fallback.
 */
async function callGeminiWithFallback<T>(prompt: string, cacheKey: string, fallback: T): Promise<T> {
  const cached = getCachedResponse<T>(cacheKey);
  if (cached !== null) { return cached; }

  const apiKey = getApiKey();
  if (!apiKey || !checkRateLimit(GEMINI_RATE_KEY)) {
    setCachedResponse(cacheKey, fallback);
    return fallback;
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text ?? '';
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = safeJsonParse<T>(jsonMatch[0]);
      if (parsed !== null) {
        isGeminiConnected = true;
        setCachedResponse(cacheKey, parsed);
        return parsed;
      }
    }
  } catch { /* Fallback to deterministic engine */ }

  setCachedResponse(cacheKey, fallback);
  return fallback;
}

/**
 * Parses a natural language change request via Gemini or deterministic extraction.
 *
 * @param context - Current event context.
 * @param input - The change request input.
 * @returns Structured change impact with deltas and summary.
 */
export async function parseChangeRequest(
  context: EventContext,
  input: ChangeRequestInput
): Promise<ParsedChangeResult> {
  const fallback = buildDeterministicChangeResult(input);
  const prompt = buildChangeRequestPrompt(context, input.rawPrompt);
  return callGeminiWithFallback<ParsedChangeResult>(prompt, `change:${input.rawPrompt}`, fallback);
}

/**
 * Generates personalized theme concepts via Gemini or deterministic templates.
 *
 * @param context - Current event context.
 * @returns Array of 3 personalized theme concepts.
 */
export async function generateThemes(context: EventContext): Promise<PersonalizedConcept[]> {
  const fallback = buildDeterministicThemes(context);
  const prompt = buildThemeGenerationPrompt(context);
  return callGeminiWithFallback(prompt, `themes:${context.occasion}:${context.totalBudget}`, fallback);
}

/** Deterministic change result from structured deltas. */
function buildDeterministicChangeResult(input: ChangeRequestInput): ParsedChangeResult {
  return {
    guestDelta: input.guestDelta ?? 0,
    budgetDeltaPercent: input.budgetDeltaPercent ?? 0,
    timelineDeltaDays: input.timelineDeltaDays ?? 0,
    impactSummary: `Applying: ${input.rawPrompt}. Budget/guest/timeline recalculated deterministically.`,
    recommendedActions: ['Review updated budget matrix', 'Check timeline for bottlenecks', 'Verify vendor capacity'],
  };
}

/** Deterministic theme generation based on occasion and budget. */
function buildDeterministicThemes(ctx: EventContext): PersonalizedConcept[] {
  const perGuest = Math.round(ctx.totalBudget / Math.max(1, ctx.guestCount));
  const base = { children: 'Kid-friendly activity zone with safe seating', seniors: 'Comfortable seating with easy access to amenities', accessibility: 'Wheelchair-accessible layout with clear signage' };
  return [
    { id: 'theme-1', title: 'Royal Heritage Elegance', estimatedCostFit: 'Well Within Budget', atmosphereSummary: `Classic Indian celebration with heritage motifs (₹${perGuest}/guest).`, multiGenerationalAdaptations: base, budgetFriendlyAlternative: 'Use marigold garlands instead of imported floral arrangements' },
    { id: 'theme-2', title: 'Modern Fusion Garden', estimatedCostFit: 'Moderate Stretch', atmosphereSummary: 'Contemporary outdoor theme blending modern and traditional elements.', multiGenerationalAdaptations: base, budgetFriendlyAlternative: 'DIY fairy lights instead of professional LED installations' },
    { id: 'theme-3', title: 'Intimate Cultural Soirée', estimatedCostFit: perGuest < 3000 ? 'Requires Trade-Off' : 'Well Within Budget', atmosphereSummary: 'Warm, close-knit gathering with folk music and regional cuisine.', multiGenerationalAdaptations: base, budgetFriendlyAlternative: 'Local folk artists instead of professional entertainment troupe' },
  ];
}

/** Parsed result from a natural language change request. */
export interface ParsedChangeResult {
  readonly guestDelta: number;
  readonly budgetDeltaPercent: number;
  readonly timelineDeltaDays: number;
  readonly impactSummary: string;
  readonly recommendedActions: readonly string[];
}
