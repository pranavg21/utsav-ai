/**
 * @fileoverview Resilient Gemini 2.5 Flash API client with native structured output,
 * dynamic import, AbortSignal timeout, and failure classification.
 */

import { z } from 'zod';
import { logger } from '../../utils/logger';
import { checkRateLimit } from '../../utils/security';
import { extractErrorMessage } from '../../utils/uiHelpers';
import {
  GEMINI_SYSTEM_INSTRUCTION,
  GEMINI_TIMEOUT_MS,
} from './config';
import { dispatchWithFailover } from './dispatcher';
import type { DeterministicReason } from './types';

const GEMINI_RATE_KEY = 'gemini-api';
let isGeminiConnected = false;
let runtimeApiKey = '';

/**
 * Sets user-provided Gemini API key at runtime.
 * @param key Gemini API key string.
 */
export function setRuntimeApiKey(key: string): void {
  runtimeApiKey = key.trim();
  isGeminiConnected = false;
}

/**
 * Retrieves the currently active Gemini API key from runtime override or environment.
 * @returns Active API key string or empty string.
 */
export function getActiveApiKey(): string {
  if (runtimeApiKey) return runtimeApiKey;
  try {
    if (import.meta.env.MODE === 'test') return '';
    if (!import.meta.env.DEV) return '';
    return import.meta.env.VITE_GEMINI_API_KEY ?? '';
  } catch {
    return '';
  }
}

/**
 * Checks whether a verified connection to Gemini API has succeeded.
 * @returns True if connected with valid key.
 */
export function getGeminiStatus(): boolean {
  return isGeminiConnected && getActiveApiKey().length > 0;
}

/** Discriminated result of structured Gemini invocation. */
export type StructuredCallResult<T> =
  | { readonly success: true; readonly data: T; readonly model: string }
  | { readonly success: false; readonly reason: DeterministicReason };

function classifyGeminiError(isAborted: boolean, errMsg: string): DeterministicReason {
  if (isAborted || errMsg.includes('aborted') || errMsg.includes('timeout')) {
    return 'timeout';
  }
  if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
    return 'quota-exceeded';
  }
  return 'invalid-output';
}

/**
 * Executes structured JSON call to Gemini 2.5 Flash validated against a Zod schema.
 * @param prompt Prompt string instructions.
 * @param schema Zod validation schema.
 * @param temperature Model sampling temperature.
 * @returns StructuredCallResult with validated data or classified failure reason.
 */
export async function executeStructuredGeminiCall<T>(
  prompt: string,
  schema: z.ZodType<T>,
  temperature: number
): Promise<StructuredCallResult<T>> {
  const apiKey = getActiveApiKey();
  if (!apiKey) return { success: false, reason: 'no-api-key' };
  if (!checkRateLimit(GEMINI_RATE_KEY)) return { success: false, reason: 'quota-exceeded' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const jsonSchema = z.toJSONSchema(schema);
    const reqConfig = {
      systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
      temperature,
      responseMimeType: 'application/json',
      responseJsonSchema: jsonSchema,
      abortSignal: controller.signal,
    };

    const { text, usedModel } = await dispatchWithFailover(
      ai,
      prompt,
      reqConfig,
      controller.signal
    );

    clearTimeout(timer);
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      logger.warn('Gemini structured response schema validation failed', {
        errors: parsed.error.issues,
      });
      return { success: false, reason: 'invalid-output' };
    }

    isGeminiConnected = true;
    return { success: true, data: parsed.data, model: usedModel };
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg = extractErrorMessage(err);
    const reason = classifyGeminiError(controller.signal.aborted, msg);
    return { success: false, reason };
  }
}

/**
 * Executes a plain Gemini prompt and returns stringified JSON or null on failure.
 * @param prompt Generation prompt string.
 * @returns Response JSON string or null.
 */
export async function executeGeminiPrompt(prompt: string): Promise<string | null> {
  const apiKey = getActiveApiKey();
  if (!apiKey) return null;
  const result = await executeStructuredGeminiCall(prompt, z.unknown(), 0.1);
  return result.success ? JSON.stringify(result.data) : null;
}
