/**
 * @fileoverview Resilient Gemini 2.5 Flash API client with native structured output,
 * dynamic import, AbortSignal timeout, and failure classification.
 */

import { z } from 'zod';
import { logger } from '../../utils/logger';
import { checkRateLimit } from '../../utils/security';
import { extractErrorMessage } from '../../utils/uiHelpers';
import {
  GEMINI_MODEL_ID,
  GEMINI_SYSTEM_INSTRUCTION,
  GEMINI_TIMEOUT_MS,
} from './config';
import type { DeterministicReason } from './types';

const GEMINI_RATE_KEY = 'gemini-api';
let isGeminiConnected = false;
let runtimeApiKey = '';

export function setRuntimeApiKey(key: string): void {
  runtimeApiKey = key.trim();
  isGeminiConnected = false;
}

export function getActiveApiKey(): string {
  if (runtimeApiKey) return runtimeApiKey;
  try {
    if (import.meta.env.MODE === 'test') return '';
    return import.meta.env.VITE_GEMINI_API_KEY ?? '';
  } catch {
    return '';
  }
}

export function getGeminiStatus(): boolean {
  return isGeminiConnected && getActiveApiKey().length > 0;
}

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
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
        temperature,
        responseMimeType: 'application/json',
        responseSchema: jsonSchema,
        abortSignal: controller.signal,
      },
    });

    clearTimeout(timer);
    const text = response.text ?? '';
    const parsed = schema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      logger.warn('Gemini structured response schema validation failed', {
        errors: parsed.error.issues,
      });
      return { success: false, reason: 'invalid-output' };
    }

    isGeminiConnected = true;
    return { success: true, data: parsed.data, model: GEMINI_MODEL_ID };
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg = extractErrorMessage(err);
    const reason = classifyGeminiError(controller.signal.aborted, msg);
    return { success: false, reason };
  }
}

export async function executeGeminiPrompt(prompt: string): Promise<string | null> {
  const apiKey = getActiveApiKey();
  if (!apiKey) return null;
  const result = await executeStructuredGeminiCall(prompt, z.unknown(), 0.1);
  return result.success ? JSON.stringify(result.data) : null;
}
