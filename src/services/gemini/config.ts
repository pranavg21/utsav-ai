/**
 * @fileoverview Single source of truth for Gemini model configuration,
 * system instructions, temperature profiles, and timeouts.
 */

/** Active Gemini model ID verified in Google AI Studio. */
export const GEMINI_MODEL_ID = 'gemini-2.5-flash';

/** Strict system instruction enforcing planner role and hallucination prevention. */
export const GEMINI_SYSTEM_INSTRUCTION =
  'You are UtsavAI, an expert celebration and event planning intelligence specializing in Indian weddings, birthdays, and community gatherings. Never invent vendor names, availability, or confirmed prices. Label every monetary figure as an estimate.';

/** Task-specific temperature profiles for deterministic vs creative reasoning. */
export const GEMINI_TEMPERATURES = {
  parsing: 0.1,
  quotes: 0.1,
  plan: 0.2,
  checklist: 0.2,
  ideas: 0.7,
} as const;

/** Hard timeout ceiling in milliseconds for all Gemini API invocations. */
export const GEMINI_TIMEOUT_MS = 15_000;

