/**
 * @fileoverview Low-level Gemini 2.5 Flash API client with rate-limiting and dynamic import.
 */

import { logger } from '../../utils/logger';
import { checkRateLimit } from '../../utils/security';
import { extractErrorMessage } from '../../utils/uiHelpers';

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

export async function executeGeminiPrompt(prompt: string): Promise<string | null> {
  const apiKey = getActiveApiKey();
  if (!apiKey || !checkRateLimit(GEMINI_RATE_KEY)) {
    return null;
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = response.text ?? '';
    isGeminiConnected = true;
    return text;
  } catch (err: unknown) {
    logger.warn('Gemini API call failed, falling back to local engine', {
      error: extractErrorMessage(err),
    });
    return null;
  }
}
